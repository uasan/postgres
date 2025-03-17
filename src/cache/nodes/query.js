import { noop, nullArray } from '#native';
import { CacheResult } from './result.js';
import { createCache } from '../explain/context.js';

export const readOnlyCache = {
  save: noop,
  get() {
    return null;
  },
};

export class CacheQuery extends Map {
  tags = nullArray;
  isTagged = false;

  unset(result) {
    this.delete(result.key);

    for (let i = 0; result.tags.length > i; i++) {
      result.tags[i].unset(result);
    }
  }

  purge() {
    if (this.isTagged) {
      for (const result of this.values())
        for (let i = 0; result.tags.length > i; i++)
          result.tags[i].unset(result);
    }
    this.clear();
  }

  save(meta, data) {
    this.set(meta.key, new CacheResult(this, meta, data));
  }

  static create(task) {
    createCache(task, new this()).catch(console.error);
    return readOnlyCache;
  }
}
