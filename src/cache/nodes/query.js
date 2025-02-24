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

  save({ key, task }, data) {
    const result = {
      key,
      data,
      hit: 0,
      cache: this,
      tags: nullArray,
    };

    if (this.tags !== nullArray) {
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
