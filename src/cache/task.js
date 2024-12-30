import { stringify } from '../utils/string.js';
import { CacheQuery } from './nodes/query.js';

async function saveCacheResult() {
  if (this.task.statement.cache?.has(this.key)) {
    return;
  }

  const stm = this.task.statement;

  stm.cache ??= await CacheQuery.create(this.task);
  stm.cache.set(this.key, this.task.data);
}

export function checkCache(task) {
  const key = stringify(task.values);
  const stm = task.client.statements.get(task.sql);

  if (stm?.cache?.has(key)) {
    task.data = stm.cache.get(key);
    return true;
  }

  task.cache = { key, task, save: saveCacheResult };
  return false;
}
