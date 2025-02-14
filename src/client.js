import { once } from 'node:events';
import { createConnection } from 'node:net';

import { noop } from '#native';
import { SQL } from './sql.js';
import { Task } from './task.js';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { Origin } from './store/origin.js';
import { PostgresError } from './response/error.js';
import { Connection } from './protocol/connection.js';
import { BaseClient } from './protocol/client.js';

import { normalizeOptions } from './utils/options.js';
import { setCommit, setRollback } from './utils/queries.js';
import {
  TRANSACTION_ACTIVE,
  TRANSACTION_ERROR,
  TRANSACTION_INACTIVE,
} from './constants.js';
import { stringify } from './utils/string.js';

export class PostgresClient extends BaseClient {
  pid = 0;
  secret = 0;
  transactions = 0;

  task = null;
  state = TRANSACTION_INACTIVE;

  pool = null;
  types = null;
  stream = null;
  origin = null;
  options = null;
  waitReady = null;

  isReady = false;
  isIsolated = false;

  queries = new Set();
  listeners = new Map();
  statements = new Map();

  queue = new Queue();
  reader = new Reader(this);
  writer = new Writer(this);
  connection = new Connection(this);

  constructor(options, pool = null) {
    super();
    if (pool) {
      this.pool = pool;
      this.options = options;
      this.types = pool.types;
      this.origin = pool.origin;
      this.statements = pool.statements;
    } else {
      this.options = normalizeOptions(options);
      this.origin = Origin.get(this.options);
      this.types = this.origin.types;
    }
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

  sql(source, ...values) {
    return new SQL(source, values, this);
  }

  async ready() {
    if (this.task) {
      this.waitReady ??= Promise.withResolvers();
      await this.waitReady.promise;
    }
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
        throw PostgresError.abortTransaction(this);
    }

    return this;
  }

  async commit() {
    await this.ready();

    switch (this.state) {
      case TRANSACTION_ACTIVE:
        await this.query(setCommit(this));
        break;

      case TRANSACTION_ERROR:
        await this.query('ROLLBACK');
        throw PostgresError.abortTransaction(this);
    }

    return this.isTransaction() ? this : this.pool ?? this;
  }

  async rollback() {
    try {
      if (this.connection.isReady) {
        await this.ready().catch(noop);

        switch (this.state) {
          case TRANSACTION_ACTIVE:
            await this.query(setRollback(this));
            break;

          case TRANSACTION_ERROR:
            await this.query('ROLLBACK');
        }
      }
    } catch (error) {
      if (error) {
        console.error(error);
      }
    }

    return this.isTransaction() ? this : this.pool ?? this;
  }

  async startTransaction(action, payload) {
    try {
      await this.begin();
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
    this.options = normalizeOptions(options);

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
    this.queries.clear();

    if (this.waitReady) {
      this.waitReady.reject();
      this.waitReady = null;
    }

    for (let task = this.queue.head; task; task = task.next) {
      task.isSent = false;
      task.statement = null;
    }
  }

  cancelTasks(error, isFinally = false) {
    this.writer.reject(error);

    if (this.task) {
      this.task.error(error);
      this.task = null;
    }

    for (let task = this.queue.head; task; task = task.next)
      if (isFinally || task.isSent) {
        this.queue.dequeue().error(error);
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
    return this.connection.disconnect(error);
  }

  isKeepAlive() {
    return (
      this.task !== null ||
      this.queue.length > 0 ||
      this.pool?.queue.length > 0 ||
      this.listeners.size > 0
    );
  }

  async onReconnected() {
    if (this.listeners.size) {
      await this.query('LISTEN ' + [...this.listeners.keys()].join(';LISTEN '));
    }
  }

  async listen(name, action) {
    if (typeof action !== 'function') {
      throw PostgresError.of('Listening handler must be function');
    }

    this.listeners.set(name, action);
    await this.query(`LISTEN ${name}`);
  }

  async unlisten(name) {
    if (this.listeners.delete(name)) {
      await this.query(`UNLISTEN ${name}`);
    }
  }

  async notify(name, value) {
    await this.query('SELECT pg_catalog.pg_notify($1::text, $2::text)', [
      name,
      value === undefined ? undefined : stringify(value),
    ]);
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
