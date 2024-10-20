import { createConnection } from 'net';
import { once } from 'events';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { Connection } from './protocol/connection.js';
import { getConnectionOptions } from './utils/options.js';
import { listen, unlisten, notify } from './request/listen.js';
import { Task } from './request/task.js';
import {
  TRANSACTION_ACTIVE,
  TRANSACTION_ERROR,
  TRANSACTION_INACTIVE,
} from './constants.js';
import { PostgresError } from './response/error.js';
import { noop } from '#native';
import { TypesMap } from './protocol/types.js';

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

  isEnded = false;
  isReady = false;
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
    if (this.isReady === false) {
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
        if (this.transactions > 1) {
          await this.query(`RELEASE SAVEPOINT _${--this.transactions}`);
        } else {
          await this.query('COMMIT');
        }
        break;

      case TRANSACTION_ERROR:
        await this.query('ROLLBACK');
        throw PostgresError.transactionAborted(this);
    }
  }

  async rollback() {
    await this.ready();

    switch (this.state) {
      case TRANSACTION_ACTIVE:
        if (this.transactions > 1) {
          await this.query(
            `ROLLBACK TO SAVEPOINT _${--this.transactions}`
          ).catch(noop);
        } else {
          await this.query('ROLLBACK').catch(noop);
        }
        break;

      case TRANSACTION_ERROR:
        await this.query('ROLLBACK').catch(noop);
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
    this.isReady = false;
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

PostgresClient.prototype.notify = notify;
PostgresClient.prototype.listen = listen;
PostgresClient.prototype.unlisten = unlisten;
