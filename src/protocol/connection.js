import { createConnection } from 'net';
import { handshake } from '../request/init.js';
import { randomTimeout } from '#native';
import { restoreListeners } from '../request/listen.js';
import { MESSAGE_TERMINATE } from './messages.js';
import { noop } from '../utils/native.js';
import { HIGH_WATER_MARK } from '../constants.js';
import { PostgresError } from '../response/error.js';

export class Connection {
  timeout = 0;
  connecting = null;
  disconnecting = null;

  constructor(client) {
    this.client = client;
    this.params = {
      path: client.options.path,
      host: client.options.host,
      port: client.options.port,
      highWaterMark: HIGH_WATER_MARK,
      onread: {
        callback: client.reader.read,
        buffer: client.reader.getBuffer,
      },
    };
  }

  onAbort = () => {
    this.client.abort(new PostgresError({ message: 'AbortSignal' }));
  };

  onConnect = () => {
    //console.log('ON-CONNECTED', this.client.options.database);
    if (this.client.stream) {
      this.timeout = 0;
      this.client.options.signal?.addEventListener('abort', this.onAbort);

      handshake(this.client);
    }
  };

  onClose = () => {
    //console.log('ON-CLOSE');

    this.client.clear();
    this.connecting = null;

    this.client.options.signal?.removeEventListener('abort', this.onAbort);

    if (this.disconnecting) {
      this.disconnecting.resolve();
      this.disconnecting = null;
    } else if (!this.client.isEnded && this.client.isKeepAlive()) {
      this.reconnect();
    }
  };

  onTimeout = () => {
    if (this.client.listeners.size === 0) this.client.disconnect();
  };

  onError = error => {
    this.client.isReady = false;

    if (this.client.task) {
      this.client.task.reject(error);
      this.client.task = null;
    }

    if (this.timeout > 60_000) {
      this.timeout = 0;
      this.client.abort(error);
    }
  };

  async connect() {
    //console.log('CONNECT', !!this.connecting);
    if (this.connecting) {
      await this.connecting.promise;
      return;
    }

    this.client.isEnded = false;
    this.disconnecting?.reject();

    this.client.stream = createConnection(this.params, this.onConnect)
      .on('error', this.onError)
      .once('close', this.onClose)
      .setNoDelay(true)
      .setKeepAlive(true, 60_000)
      .setTimeout(120_000, this.onTimeout);

    this.connecting = Promise.withResolvers();

    if (this.client.task) {
      this.client.queue.unshift(this.client.task);
    }

    this.client.task = this.connecting.promise;
    this.client.task.reject = this.connecting.reject;
    this.client.task.onReady = this.connecting.resolve;

    this.client.writer.lock();

    try {
      await this.connecting.promise;
      this.client.isReady = true;

      //console.log('ON-READY');

      if (this.client.listeners.size) {
        restoreListeners.call(this.client);
      }

      this.client.writer.unlock();
      this.client.task?.send();
    } finally {
      this.connecting = null;
    }
  }

  async disconnect() {
    //console.log('DISCONNECT');

    if (this.client.stream && this.disconnecting === null) {
      this.disconnecting = Promise.withResolvers();

      this.client.isEnded = true;
      this.client.isReady = false;
      this.client.isIsolated = true;

      this.connecting?.reject();

      this.client.writer.lock();
      this.client.writer.reject?.();
      this.client.stream.end(MESSAGE_TERMINATE);
    }

    await this.disconnecting?.promise;
  }

  async reconnect() {
    //console.log('RETRY');
    this.timeout += await randomTimeout;

    if (this.client.stream === null) {
      this.connect().catch(noop);
    }
  }
}
