export class CacheResult extends Set {
  key = null;
  version = 0;
  column = null;

  constructor(column, key) {
    super();
    this.key = key;
    this.column = column;
    this.version = column.table.version;
  }

  unset(result) {
    this.delete(result);

    if (this.size === 0) {
      this.column.delete(this.key);
    }
  }

  invalidate() {
    this.column.delete(this.key);

    console.log(
      'INVALIDATE',
      this.column.table.name,
      this.column.name,
      this.key
    );

    for (const result of this) {
      result.cache.delete(result.key);

      for (let i = 0; result.tags.length > i; i++) {
        if (this !== result.tags[i]) {
          result.tags[i].unset(result);
        }
      }
    }
  }
}
