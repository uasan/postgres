import { CacheContext } from '../explain/context.js';

export class CacheQuery extends Map {
  static async create(task) {
    await CacheContext.create(task);

    return new this();
  }
}
