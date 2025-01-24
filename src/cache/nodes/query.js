import { noop } from '#native';
import { CacheContext } from '../explain/context.js';

export const readOnlyCache = new (class ReadOnlyCacheQuery extends Map {
  save = noop;
})();

export class CacheQuery extends Map {
  save({ key }, data) {
    this.set(key, data);
  }

  static create(task) {
    CacheContext.analyze(task, new this()).catch(console.error);
    return readOnlyCache;
  }
}
