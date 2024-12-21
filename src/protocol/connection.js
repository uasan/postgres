import { createConnection } from 'net';
import { handshake } from '../request/init.js';
import { randomTimeout } from '#native';
import { restoreListeners } from '../request/listen.js';
import { MESSAGE_TERMINATE } from './messages.js';
import { noop } from '../utils/native.js';
import { PostgresError } from '../response/error.js';
import { TRANSACTION_ACTIVE } from '../constants.js';

export class Connection {
  retries = 0;
  onRead = noop;

  isReady = false;
  isEnded = false;
  isAbortTransaction = false;

  error = null;
  connected = null;
  connecting = null;
  disconnecting = null;

  constructor(client) {
    this.client = client;

    this.onRead = {
      callback: client.reader.read.bind(client.reader),
      buffer: client.reader.getBuffer.bind(client.reader),
    };
  }

  onAbort = () => {
    this.disconnect();
  };

  onConnect = () => {
    if (this.client.stream) {
      this.client.options.signal?.addEventListener('abort', this.onAbort);
      handshake(this.client);
    }
  };

  onClose = () => {
    let isFinally = false;

    if (this.client.state === TRANSACTION_ACTIVE) {
      isFinally = true;
      this.isAbortTransaction = !this.client.task;
    } else if (PostgresError.is(this.error)) {
      isFinally = true;
    }

    this.isReady = false;
    this.connecting = null;

    this.client.clear();
    this.client.options.signal?.removeEventListener('abort', this.onAbort);

    if (this.error) {
      this.client.cancelTasks(this.error, isFinally);
      this.error = null;
    } else if (this.client.task?.isSent) {
      this.client.cancelTasks(PostgresError.of('Connection close'), isFinally);
    }

    if (this.disconnecting) {
      this.disconnecting.resolve();
      this.disconnecting = null;
    } else if (this.isNeedReconnect()) {
      this.reconnect();
    }
  };

  onTimeout = () => {
    if (this.isKeepAlive()) {
      this.client.stream.setTimeout(
        this.client.options.timeout,
        this.onTimeout
      );
    } else {
      this.disconnect();
    }
  };

  onError = error => {
    this.error ??= error;

    if (this.retries === 3) {
      console.error(new PostgresError(error));
    }
  };

  async connect(isNotReconnect = false) {
    if (this.isAbortTransaction) {
      this.isAbortTransaction = false;

      this.client.cancelTasks(
        PostgresError.abortTransaction(this.client),
        true
      );
    }

    if (this.connecting) {
      await this.connecting.promise.catch(noop);
    } else if (this.disconnecting) {
      await this.disconnecting.promise;
    }

    if (this.isReady) {
      return;
    }

    this.isEnded = false;
    this.disconnecting?.resolve();

    this.client.stream = createConnection(
      {
        onread: this.onRead,
        path: this.client.options.path,
        host: this.client.options.host,
        port: this.client.options.port,
      },
      this.onConnect
    )
      .on('error', this.onError)
      .once('close', this.onClose)
      .setNoDelay(true)
      .setKeepAlive(true, 60_000)
      .setTimeout(this.client.options.timeout, this.onTimeout);

    this.connected ??= Promise.withResolvers();
    this.connecting = Promise.withResolvers();

    if (this.client.task) {
      this.client.queue.unshift(this.client.task);
    }

    this.client.task = this.client.prepare();
    this.client.task.reject = this.connecting.reject;
    this.client.task.onReady = this.connecting.resolve;

    this.client.writer.lock();

    try {
      await this.connecting.promise;

      this.retries = 0;
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
        throw new PostgresError((this.error = e));
      } else {
        await this.connected.promise;
      }
    } finally {
      this.connected = null;
      this.connecting = null;
    }
  }

  isKeepAlive() {
    return (
      this.client.task !== null ||
      this.client.queue.length > 0 ||
      this.client.listeners.size > 0
    );
  }

  isNeedReconnect() {
    return !this.isEnded && this.isKeepAlive();
  }

  async reconnect() {
    this.retries++;
    await randomTimeout;

    if (this.client.stream === null) {
      this.connect(true).catch(noop);
    }
  }

  async disconnect(error) {
    if (this.client.stream && this.disconnecting === null) {
      this.disconnecting = Promise.withResolvers();

      this.isEnded = true;
      this.error ??= error;

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
