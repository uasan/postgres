import { PostgresReplication } from '../../replication.js';

export class CacheOrigin {
  replica = null;

  constructor(options) {
    this.replica = new PostgresReplication({
      ...options,
      ...options.cache?.subscribe,
    });
  }
}
