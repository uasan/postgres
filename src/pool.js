import { Client } from './client.js';
import { getConnectionOptions } from './utils/options.js';

export class Pool extends Array {
  constructor(options) {
    options = getConnectionOptions(options);

    super(options.max);
    this.options = options;

    for (let i = 0; i < this.length; i++) this[i] = new Client(options);
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

  query(sql, values, options) {
    return this.getClient().query(sql, values, options);
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

  transaction(action, params) {
    let client = this.getClient(1);

    if (client.isIsolated) {
      client = new Client(this.options);
      this.push(client);
    }

    return client.transaction(action, params);
  }

  async end() {
    await Promise.all(this.map(client => client.end()));
  }
}
