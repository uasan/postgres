import { stringify } from '../utils/string.js';

export class CacheResults extends Map {
  static check(task) {
    const key = stringify(task.values).slice(1, -1);
    const stm = task.client.statements.get(task.sql);

    if (stm?.cache?.has(key)) {
      task.data = stm.cache.get(key);
      return true;
    }

    task.cache.key = key;
    return false;
  }

  static save(task, data) {
    task.statement.cache ??= new this();
    task.statement.cache.set(task.cache.key, data);
    return data;
  }
}
