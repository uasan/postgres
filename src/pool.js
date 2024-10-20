import { PostgresClient } from './client.js';
import { TypesMap } from './protocol/types.js';
import { getConnectionOptions } from './utils/options.js';

export class PostgresPool extends Array {
  types = new TypesMap();

  constructor(options) {
    options = getConnectionOptions(options);

    super(options.maxConnections);
    this.options = options;

    for (let i = 0; i < this.length; i++)
      this[i] = new PostgresClient(options, this);
  }

  connect() {
    return this[0].connect();
  }

  getClient(i = 0) {
    let client = this[i];

    while (client.queue.length && ++i < this.length)
      if (
        this[i].isIsolated === false &&
        this[i].queue.length < client.queue.length
      )
        client = this[i];

    return client;
  }

  prepare() {
    return this.getClient().prepare();
  }

  query(sql, values) {
    return this.getClient().query(sql, values);
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

  disconnect() {
    return Promise.all(this.map(client => client.disconnect()));
  }
}
