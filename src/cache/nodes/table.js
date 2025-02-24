import { nullArray } from '#native';
import { CacheColumn } from './column.js';

export class CacheTable extends Set {
  name = '';
  version = 0;

  constructor({ name, keys }, xid) {
    super();

    this.name = name;
    this.version = xid;

    for (let i = 0; i < keys.length; i++) {
      keys[i].cache = new CacheColumn(this, keys[i]);
    }
  }

  invalidate(xid) {
    this.version = xid;

    for (const query of this) {
      if (query.tags !== nullArray) {
        for (const result of query.values()) {
          for (let i = 0; result.tags.length > i; i++) {
            result.tags[i].unset(result);
          }
        }
      }
      query.clear();
    }
  }
}
