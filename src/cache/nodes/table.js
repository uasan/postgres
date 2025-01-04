export class CacheTable {
  version = 0;
  queries = new Set();

  invalidate(xid) {
    if (this.version !== xid) {
      this.version = xid;

      for (const query of this.queries) {
        query.clear();
      }
    }
  }
}
