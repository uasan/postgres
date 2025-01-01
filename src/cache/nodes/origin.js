import { PostgresReplication } from '../../replication.js';
import { handler } from '../replica/handler.js';

export class CacheOrigin {
  replica = null;
  publication = '';

  constructor(options) {
    this.publication = options.ns + 'cache';

    this.replica = new PostgresReplication({
      ...options,
      ...options.cache?.subscribe,
    });

    this.replica.subscribe([this.publication], handler).catch(console.error);
  }
}
