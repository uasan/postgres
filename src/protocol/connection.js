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

  promiseConnect = null;
  resolveConnect = noop;
  rejectConnect = noop;

  promiseDisconnect = null;
  resolveDisconnect = noop;
  rejectDisconnect = noop;

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
    if (this.client.stream === null) return;
    //console.log('ON-CONNECT');

    this.timeout = 0;
    this.client.options.signal?.addEventListener('abort', this.onAbort);

    handshake(this.client);
  };

  onClose = () => {
    //console.log('ON-CLOSE');

    this.client.clear();
    this.promiseConnect = null;

    this.client.options.signal?.removeEventListener('abort', this.onAbort);

    if (this.promiseDisconnect) {
      this.resolveDisconnect();
      this.resolveDisconnect = noop;
      this.rejectDisconnect = noop;
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
    if (this.promiseConnect) return await this.promiseConnect;

    this.client.isEnded = false;
    this.rejectDisconnect();

    this.client.stream = createConnection(this.params, this.onConnect)
      .on('error', this.onError)
      .once('close', this.onClose)
      .setNoDelay(true)
      .setKeepAlive(true, 60_000)
      .setTimeout(120_000, this.onTimeout);

    this.promiseConnect = new Promise((resolve, reject) => {
      this.rejectConnect = reject;
      this.resolveConnect = resolve;
    });

    if (this.client.task && this.client.task !== this.promiseConnect) {
      this.client.queue.unshift(this.client.task);
    }

    this.client.task = this.promiseConnect;
    this.client.task.reject = this.rejectConnect;
    this.client.task.onReady = this.resolveConnect;

    this.client.writer.lock();

    try {
      await this.promiseConnect;

      this.client.isReady = true;

      //console.log('ON-READY');

      if (this.client.listeners.size) {
        restoreListeners.call(this.client);
      }

      this.client.writer.unlock();
      this.client.task?.send();
    } finally {
      this.rejectConnect = noop;
      this.resolveConnect = noop;
    }
  }

  disconnect() {
    if (this.promiseDisconnect === null) {
      this.client.isEnded = true;
      this.client.isReady = false;
      this.client.isIsolated = true;

      this.rejectConnect();

      this.promiseDisconnect = new Promise((resolve, reject) => {
        this.resolveDisconnect = resolve;
        this.rejectDisconnect = reject;
      });

      if (this.client.stream) {
        this.client.writer.lock();
        this.client.writer.reject?.();
        this.client.stream.end(MESSAGE_TERMINATE);
      } else {
        this.onClose();
      }
    }

    return this.promiseDisconnect;
  }

  async reconnect() {
    //console.log('RETRY');
    this.timeout += await randomTimeout;

    if (this.client.stream === null) {
      this.connect().catch(noop);
    }
  }
}
