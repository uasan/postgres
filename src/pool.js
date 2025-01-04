import { PostgresClient } from './client.js';
import { PostgresError } from './response/error.js';
import { Origin } from './store/origin.js';
import { Task } from './task.js';
import { normalizeOptions } from './utils/options.js';

export class PostgresPool extends Array {
  types = null;
  origin = null;
  statements = new Map();

  constructor(options) {
    options = normalizeOptions(options);
    super(options.maxConnections);

    this.origin = Origin.get(options);
    this.types = this.origin.types;

    for (let i = 0; i < this.length; i++)
      this[i] = new PostgresClient(options, this);
  }

  connect() {
    return this[0].connect();
  }

  getClient(i = 0) {
    let client = this[i];

    if (client.isReady && client.isIsolated === false) {
      return client;
    }

    while (++i < this.length) {
      if (
        this[i].isIsolated === false &&
        (client.isIsolated || this[i].queue.length < client.queue.length)
      ) {
        client = this[i];
      }
    }

    if (client.isIsolated) {
      throw PostgresError.poolOverflow();
    }

    return client;
  }

  prepare() {
    return new Task(this.getClient());
  }

  query(sql, values) {
    return new Task(this.getClient()).execute(sql, values);
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

  isolate() {
    return this.getClient(1).isolate();
  }

  isTransaction() {
    return false;
  }

  disconnect() {
    return Promise.all(this.map(client => client.disconnect()));
  }
}
