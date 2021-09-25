import { Client } from './client.js';
import { getConnectionOptions } from './utils/options.js';

export class Pool {
  constructor(options) {
    this.options = getConnectionOptions(options);
    this.clients = new Array(this.options.max);

    for (let i = 0; i < this.clients.length; i++)
      this.clients[i] = new Client(this.options);
  }

  query(sql, values, options) {
    const { clients } = this;
    let client = clients[0];

    for (let i = 1; client.queue.length && i < clients.length; i++)
      if (
        clients[i].isIsolated === false &&
        clients[i].queue.length < client.queue.length
      )
        client = clients[i];

    return client.query(sql, values, options);
  }

  connect() {
    return this.clients[0].connect();
  }

  listen(name, handler) {
    return this.clients[0].listen(name, handler);
  }

  unlisten(name, handler) {
    return this.clients[0].unlisten(name, handler);
  }

  notify(name, value) {
    return this.clients[0].notify(name, value);
  }

  transaction(action, params) {
    const { clients } = this;

    for (let i = 0; i < clients.length; i++)
      if (clients[i].isReady && clients[i].isIsolated === false)
        return clients[i].transaction(action, params);

    for (let i = 0; i < clients.length; i++)
      if (clients[i].isIsolated === false)
        return clients[i].transaction(action, params);

    return new Client(this.options).transaction(action, params);
  }

  async end() {
    await Promise.all(this.clients.map(client => client.end()));
  }
}
