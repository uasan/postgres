import { CacheContext } from '../explain/context.js';

export class CacheQuery extends Map {
  static async create(task) {
    const { tables } = await CacheContext.create(task);
    const query = new this();

    for (const [{ cache }, columns] of tables) {
      if (columns.size === 0) {
        cache.queries.add(query);
      }
    }

    return query;
  }
}
