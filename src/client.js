import { once } from 'node:events';
import { createConnection } from 'node:net';

import { noop } from '#native';
import { Task } from './task.js';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { TypesMap } from './protocol/types.js';
import { PostgresError } from './response/error.js';
import { Connection } from './protocol/connection.js';
import { getConnectionOptions } from './utils/options.js';
import { setCommit, setRollback } from './utils/queries.js';
import { listen, unlisten, notify } from './request/listen.js';
import {
  TRANSACTION_ACTIVE,
  TRANSACTION_ERROR,
  TRANSACTION_INACTIVE,
} from './constants.js';

export class PostgresClient {
  pid = 0;
  secret = 0;
  transactions = 0;

  task = null;
  state = TRANSACTION_INACTIVE;

  pool = null;
  types = null;
  stream = null;
  waitReady = null;
  connection = null;

  isReady = true;
  isIsolated = false;

  listeners = new Map();
  statements = new Map();

  queue = new Queue();
  reader = new Reader(this);
  writer = new Writer(this);

  constructor(options, pool = null) {
    if (pool) {
      this.pool = pool;
      this.options = options;
      this.types = pool.types;
    } else {
      this.types = new TypesMap();
      this.options = getConnectionOptions(options);
    }

    this.connection = new Connection(this);
  }

  connect() {
    return this.connection.connect();
  }

  prepare() {
    return new Task(this);
  }

  query(sql, values) {
    return new Task(this).execute(sql, values);
  }

  async ready() {
    if (this.task) {
      this.waitReady ??= Promise.withResolvers();
      await this.waitReady.promise;
    }
  }

  isolate() {
    this.isolated = true;
    return this;
  }

  unIsolate() {
    this.isIsolated = false;
    return this.pool ?? this;
  }

  isTransaction() {
    return this.state === TRANSACTION_ACTIVE;
  }

  async begin() {
    await this.ready();

    switch (this.state) {
      case TRANSACTION_INACTIVE:
        await this.query('BEGIN');
        break;

      case TRANSACTION_ACTIVE:
        await this.query(`SAVEPOINT _${this.transactions++}`);
        break;

      case TRANSACTION_ERROR:
        await this.query('ROLLBACK');
        throw PostgresError.transactionAborted(this);
    }
  }

  async commit() {
    await this.ready();

    switch (this.state) {
      case TRANSACTION_ACTIVE:
        await this.query(setCommit(this));
        break;

      case TRANSACTION_ERROR:
        await this.query('ROLLBACK');
        throw PostgresError.transactionAborted(this);
    }
  }

  async rollback() {
    try {
      await this.ready().catch(noop);

      if (this.connection.isReady) {
        switch (this.state) {
          case TRANSACTION_ACTIVE:
            await this.query(setRollback(this));
            break;

          case TRANSACTION_ERROR:
            await this.query('ROLLBACK');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async startTransaction(action, payload) {
    try {
      await this.query('BEGIN');
      const result = await action(this, payload);

      await this.commit();

      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async reset(options) {
    await this.connection.disconnect();

    this.types.clear();
    this.options = getConnectionOptions(options);

    await this.connection.connect();
  }

  clear() {
    this.pid = 0;
    this.secret = 0;
    this.transactions = 0;

    this.stream = null;
    this.isReady = true;
    this.isIsolated = false;
    this.state = TRANSACTION_INACTIVE;

    this.reader.clear();
    this.writer.clear();
    this.statements.clear();

    if (this.waitReady) {
      this.waitReady.reject();
      this.waitReady = null;
    }

    //console.log('CLEAR');

    for (let task = this.queue.head; task; task = task.next) {
      task.isSent = false;
      task.statement = null;
    }
  }

  cancelTasks(error, isFinally = false) {
    this.writer.reject(error);

    if (this.task) {
      this.task.onError(error);
      this.task.reject(error);

      this.task = null;
    }

    for (let task = this.queue.head; task; task = task.next)
      if (isFinally || task.isSent) {
        this.queue.dequeue();
        task.onError(error);
        task.reject(error);
      } else {
        break;
      }

    return this;
  }

  async cancelRequest({ pid, secret } = this) {
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
  }

  abort(error) {
    return this.cancelTasks(error, true).disconnect(error);
  }

  async disconnect(error) {
    if (error) {
      await this.connection.disconnect(error);
    } else {
      await this.ready();
      await this.connection.disconnect();
    }
  }
}

PostgresClient.prototype.notify = notify;
PostgresClient.prototype.listen = listen;
PostgresClient.prototype.unlisten = unlisten;
