import { noop, nullArray } from '#native';
import { CacheContext } from '../explain/context.js';

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

  unsetAll() {
    if (this.isTagged) {
      for (const result of this.values()) {
        for (let i = 0; result.tags.length > i; i++) {
          result.tags[i].unset(result);
        }
      }
    }
    this.clear();
  }

  save({ key, task }, data) {
    const result = {
      key,
      data,
      hit: 0,
      cache: this,
      tags: nullArray,
    };

    if (this.isTagged) {
      result.tags = [];

      for (let i = 0; this.tags.length > i; i++) {
        this.tags[i].set(task, result);
      }
    }

    this.set(key, result);
  }

  static create(task) {
    CacheContext.analyze(task, new this()).catch(console.error);
    return readOnlyCache;
  }
}
