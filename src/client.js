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
import { then, nullArray } from '#native';
import { Statement } from './request/statement.js';
import {
  putData,
  pushData,
  setDataValue,
  setDataFields,
} from './response/data.js';
import {
  FETCH_ALL,
  TYPE_NATIVE,
  FETCH_ONE_VALUE,
  TRANSACTION_INACTIVE,
} from './constants.js';

export class Client {
  pid = 0;
  secret = 0;
  transactionState = TRANSACTION_INACTIVE;

  task = null;
  stream = null;
  timeZone = null;

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
    this.transactionState = TRANSACTION_INACTIVE;

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
    //console.log('onReadyForQuery');
    this.task = this.queue.dequeue();
    this.transactionState = this.reader.uint8[this.reader.offset];
  }

  async query(sql, values = nullArray, options = FETCH_ALL | TYPE_NATIVE) {
    if (this.connection.stream === null) this.connection.connect();
    await this.writer.ready;

    const task = {
      sql,
      then,
      values,
      options,
      reject: null,
      resolve: null,
      statement: null,
      controller: null,
      data: options & FETCH_ALL ? [] : null,
      addData: options & FETCH_ALL ? pushData : putData,
      setData: options & FETCH_ONE_VALUE ? setDataValue : setDataFields,
    };

    if (this.task) {
      this.queue.enqueue(task);
    } else this.task = task;

    task.statement =
      this.statements.get(sql)?.execute(values) ?? new Statement(this, task);

    return await task;
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
    return this.queue.length || this.writer.queue.length || this.listeners.size;
  }

  end = () => {
    if (this.isConnected) {
      this.isEnded = true;
      this.isReady = false;
      this.isIsolated = true;
      this.isConnected = false;

      const { stream } = this;
      this.stream = null;

      if (this.task) this.cancelRequest();
      stream.end(MESSAGE_TERMINATE);
    }
  };
}

Client.prototype.notify = notify;
Client.prototype.listen = listen;
Client.prototype.unlisten = unlisten;
Client.prototype.transaction = transaction;
