import { noop } from '#native';
import { CacheContext } from '../explain/context.js';

export const readOnlyCache = new (class ReadOnlyCacheQuery extends Map {
  save = noop;
  get() {
    return null;
  }
})();

export class CacheQuery extends Map {
  save({ key }, data) {
    this.set(key, {
      data,
      hit: 0,
      key,
      map: this,
    });
  }

  static create(task) {
    CacheContext.analyze(task, new this()).catch(console.error);
    return readOnlyCache;
  }
}
