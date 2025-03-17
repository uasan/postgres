export class CacheTag extends Set {
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
    for (const result of this) {
      result.purge();
    }
  }
}
