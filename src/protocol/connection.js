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
  isReady = false;

  error = null;
  connected = null;
  connecting = null;
  disconnecting = null;

  constructor(client) {
    this.client = client;
    this.timeout = client.options.timeout;

    this.params = {
      path: client.options.path,
      host: client.options.host,
      port: client.options.port,
      highWaterMark: HIGH_WATER_MARK,
      onread: {
        callback: client.reader.read.bind(client.reader),
        buffer: client.reader.getBuffer,
      },
    };
  }

  onAbort = () => {
    this.client.cancelTasks(PostgresError.of('AbortSignal'));
  };

  onConnect = () => {
    if (this.client.stream) {
      this.client.options.signal?.addEventListener('abort', this.onAbort);
      handshake(this.client);
    }
  };

  onClose = () => {
    this.isReady = false;
    this.client.clear();
    this.connecting = null;

    this.client.options.signal?.removeEventListener('abort', this.onAbort);

    if (this.error) {
      this.client.cancelTasks(
        new PostgresError(this.error),
        PostgresError.is(this.error)
      );
      this.error = null;
    } else if (this.client.task?.isSent) {
      this.client.cancelTasks(PostgresError.of('Connection close'));
    }

    if (this.disconnecting) {
      this.disconnecting.resolve();
      this.disconnecting = null;
    } else if (this.isNeedReconnect()) {
      this.reconnect();
    }
  };

  onTimeout = () => {
    if (this.isKeepAlive() === false) {
      this.client.disconnect(PostgresError.of('Timeout')).catch(noop);
    }
  };

  onError = error => {
    this.error = error;
  };

  async connect(isNotReconnect = false) {
    if (this.connecting) {
      await this.connecting.promise.catch(noop);
      return;
    } else if (this.client.stream) {
      if (this.disconnecting) await this.disconnecting.promise.catch(noop);
      else return;
    }

    this.client.isEnded = false;
    this.disconnecting?.reject();

    this.client.stream = createConnection(this.params, this.onConnect)
      .on('error', this.onError)
      .once('close', this.onClose)
      .setNoDelay(true)
      .setKeepAlive(true, 60_000)
      .setTimeout(this.timeout, this.onTimeout);

    this.connected ??= Promise.withResolvers();
    this.connecting = Promise.withResolvers();

    if (this.client.task) {
      this.client.queue.unshift(this.client.task);
    }

    this.client.task = this.connecting.promise;
    this.client.task.onError = noop;
    this.client.task.reject = this.connecting.reject;
    this.client.task.onReady = this.connecting.resolve;

    this.client.writer.lock();

    try {
      await this.connecting.promise;

      this.isReady = true;

      if (this.client.listeners.size) {
        restoreListeners.call(this.client);
      }

      this.client.writer.unlock();
      this.client.task?.send();

      this.connected.resolve();
    } catch (e) {
      this.connecting = null;
      this.client.task = null;

      if (isNotReconnect || PostgresError.is(e) || !this.isNeedReconnect()) {
        this.error = e;
        throw this.error;
      } else {
        await this.connected.promise;
      }
    } finally {
      this.connecting = null;
      this.connected = null;
    }
  }

  isKeepAlive() {
    return (
      this.client.task != null ||
      this.client.queue.length > 0 ||
      this.client.listeners.size > 0
    );
  }

  isNeedReconnect() {
    return !this.client.isEnded && this.isKeepAlive();
  }

  async reconnect() {
    await randomTimeout;

    if (this.client.stream === null) {
      this.connect(true).catch(noop);
    }
  }

  async disconnect(error) {
    if (this.client.stream && this.disconnecting === null) {
      this.disconnecting = Promise.withResolvers();

      this.client.isEnded = true;
      this.client.isIsolated = true;

      this.connected?.reject(error);
      this.connecting?.reject(error);

      this.client.writer.lock();
      this.client.writer.reject(error);
      this.client.stream.end(MESSAGE_TERMINATE);
    }

    await this.disconnecting?.promise;
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
