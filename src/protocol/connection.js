import { createConnection } from 'node:net';
import { handshake } from '../request/init.js';
import { randomTimeout } from '#native';
import { MESSAGE_TERMINATE } from './messages.js';
import { noop } from '../utils/native.js';
import { PostgresError } from '../response/error.js';
import { TRANSACTION_ACTIVE } from '../constants.js';

export class Connection {
  retries = 0;

  isReady = false;
  isEnded = false;
  isAbortTransaction = false;

  task = null;
  error = null;
  client = null;
  onRead = null;
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

  onTimeout(error) {
    if (this.client.isKeepAlive()) {
      console.error(new PostgresError(error));
    } else {
      this.isEnded = true;
    }
  }

  onError = error => {
    this.error ??= error;

    if (this.retries === 3) {
      console.error(error);
    }
  };

  async connect(isNotReconnect = false) {
    if (this.isAbortTransaction) {
      this.isAbortTransaction = false;

      this.client.cancelTasks(
        PostgresError.abortTransaction(this.client),
        true,
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
      this.onConnect,
    )
      .setNoDelay(true)
      .setKeepAlive(true, 300000)
      .on('error', this.onError)
      .once('close', this.onClose)
      .on('drain', this.client.writer.onDrain);

    this.connected ??= Promise.withResolvers();
    this.connecting = Promise.withResolvers();

    if (this.client.task && this.task !== this.client.task) {
      this.client.queue.unshift(this.client.task);
    }

    this.task ??= this.client.prepare();
    this.client.task = this.task;

    this.task.reject = this.connecting.reject;
    this.task.onReady = this.connecting.resolve;

    try {
      await this.connecting.promise;
      this.isReady = true;

      if (this.retries) {
        this.retries = 0;
        this.client.onReconnected();
      }

      this.task = null;
      this.connected.resolve();
    } catch (e) {
      this.connecting = null;
      this.client.task = null;

      if (
        isNotReconnect ||
        !this.isNeedReconnect() ||
        PostgresError.isFatal(e)
      ) {
        this.error = e;
        throw e && new PostgresError(e);
      } else {
        await this.connected.promise;
      }
    } finally {
      this.connected = null;
      this.connecting = null;
    }
  }

  isNeedReconnect() {
    return !this.isEnded && this.client.isKeepAlive();
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

      this.client.writer.reject(error);
      this.client.stream.end(MESSAGE_TERMINATE);
    }

    await this.disconnecting?.promise;
  }

  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}
