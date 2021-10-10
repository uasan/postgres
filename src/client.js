import { createConnection } from 'net';
import { once } from 'events';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { AbortError } from './utils/errors.js';
import { Connection } from './protocol/connection.js';
import { getConnectionOptions } from './utils/options.js';
import { transaction } from './request/transaction.js';
import { listen, unlisten, notify } from './request/listen.js';
import { MESSAGE_TERMINATE } from './protocol/messages.js';
import { Task } from './request/task.js';
import { TRANSACTION_INACTIVE } from './constants.js';

export class Client {
  pid = 0;
  secret = 0;

  task = null;
  state = TRANSACTION_INACTIVE;
  stream = null;

  isEnded = false;
  isReady = false;
  isIsolated = false;
  isConnected = false;

  queue = new Queue();
  listeners = new Map();
  statements = new Map();

  reader = new Reader(this);
  writer = new Writer(this);

  constructor(options) {
    this.options = getConnectionOptions(options);
    this.connection = new Connection(this);
  }

  connect() {
    return this.connection.connect();
  }

  async clear() {
    this.pid = 0;
    this.secret = 0;
    this.stream = null;
    this.state = TRANSACTION_INACTIVE;

    this.reader.clear();
    this.statements.clear();

    //console.log('CLEAR');

    this.isReady = false;
    this.isIsolated = false;
    this.isConnected = false;

    if (this.task) {
      this.task.reject(new AbortError());
      this.task = null;
    }

    if (this.queue.length) {
      await this.cancelQueue();
    }
  }

  onReadyForQuery() {
    this.task = this.queue.dequeue();
    this.state = this.reader.uint8[this.reader.offset];
  }

  async query(sql, values, options) {
    return await new Task(this, sql, values, options);
  }

  cancelQueue(reason = new AbortError()) {
    while (this.queue.length) this.queue.dequeue().reject?.(reason);
    return this.writer.clear();
  }

  cancelRequest = async ({ pid, secret } = this) => {
    const data = new DataView(new ArrayBuffer(16));

    data.setInt32(0, 16);
    data.setInt32(4, 80877102);
    data.setInt32(8, pid);
    data.setInt32(12, secret);

    const socket = createConnection(
      {
        path: this.options.path,
        host: this.options.host,
        port: this.options.port,
      },
      () => socket.end(new Uint8Array(data.buffer))
    );

    await once(socket, 'close');
  };

  isKeepAlive() {
    return this.queue.length || this.listeners.size;
  }

  end = error => {
    if (this.stream) {
      this.isEnded = true;
      this.isReady = false;
      this.isIsolated = true;

      const { stream } = this;
      this.stream = null;

      if (error) this.cancelQueue(error);
      if (this.task) this.cancelRequest();

      stream.end(MESSAGE_TERMINATE);
    }
  };
}

Client.prototype.notify = notify;
Client.prototype.listen = listen;
Client.prototype.unlisten = unlisten;
Client.prototype.transaction = transaction;
