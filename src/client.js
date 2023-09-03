import { createConnection } from 'net';
import { once } from 'events';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { Connection } from './protocol/connection.js';
import { getConnectionOptions } from './utils/options.js';
import { transaction } from './request/transaction.js';
import { listen, unlisten, notify } from './request/listen.js';
import { Task } from './request/task.js';
import { TRANSACTION_INACTIVE } from './constants.js';
import { PostgresError } from './response/error.js';

export class Client {
  pid = 0;
  secret = 0;

  task = null;
  state = TRANSACTION_INACTIVE;
  stream = null;

  isEnded = false;
  isReady = false;
  isIsolated = false;

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

  async query(sql, values, options) {
    try {
      return await new Task(this, sql, values, options);
    } catch (error) {
      throw new PostgresError(error);
    }
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
    return this.queue.length > 0 || this.listeners.size > 0;
  }

  async setOptions(options) {
    await this.connection.disconnect();
    this.options = getConnectionOptions(options);
    await this.connection.connect();
  }

  clear() {
    this.pid = 0;
    this.secret = 0;
    this.stream = null;
    this.isReady = false;
    this.isIsolated = false;
    this.state = TRANSACTION_INACTIVE;

    this.reader.clear();
    this.writer.clear();
    this.statements.clear();

    //console.log('CLEAR');

    for (let task = this.queue.head; task; task = task.next)
      task.statement = null;
  }

  disconnect() {
    return this.connection.disconnect();
  }

  abort(error) {
    this.writer.reject?.(error);

    if (this.task) {
      this.task.reject(error);
      this.task = null;
    }

    return this.connection.disconnect();
  }
}

Client.prototype.notify = notify;
Client.prototype.listen = listen;
Client.prototype.unlisten = unlisten;
Client.prototype.transaction = transaction;
