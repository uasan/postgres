import { SQL } from './sql.js';
import { Task } from './task.js';
import { Queue } from './utils/queue.js';
import { Origin } from './store/origin.js';
import { PostgresClient } from './client.js';
import { normalizeOptions } from './utils/options.js';

export class PostgresPool extends Array {
  task;
  stream;

  types = null;
  origin = null;
  options = null;

  queue = new Queue();
  statements = new Map();

  constructor(options) {
    options = normalizeOptions(options);
    super(options.maxConnections).options = options;

    this.origin = Origin.get(options);
    this.types = this.origin.types;

    for (let i = 0; i < this.length; i++)
      this[i] = new PostgresClient(options, this);
  }

  connect() {
    return this[0].connect();
  }

  getClient() {
    let i = 0;

    do {
      if (this[i].isReady && this[i].isIsolated === false) {
        return this[i];
      } else if (this[i].stream === null) {
        this[i].connection.connect().catch(console.error);
        break;
      }
    } while (++i < this.length && this[i].connection.connecting === null);

    return this;
  }

  sql(source, ...values) {
    return new SQL(source, values, this);
  }

  prepare() {
    return new Task(this.getClient());
  }

  query(sql, values) {
    return new Task(this.getClient()).execute(sql, values);
  }

  async begin() {
    const task = this.prepare();
    await task.execute('BEGIN');
    return task.client;
  }

  async rollback() {
    return this;
  }

  listen(name, handler) {
    return this[0].listen(name, handler);
  }

  unlisten(name, handler) {
    return this[0].unlisten(name, handler);
  }

  notify(name, value) {
    return this[0].notify(name, value);
  }

  isTransaction() {
    return false;
  }

  disconnect() {
    return Promise.all(this.map(client => client.disconnect()));
  }
}
