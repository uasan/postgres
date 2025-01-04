import { stringify } from '../utils/string.js';
import { CacheQuery } from './nodes/query.js';

function saveCacheResult() {
  if (this.task.statement.cache?.has(this.key)) {
    return;
  }

  const stm = this.task.statement;

  try {
    stm.cache ??= new CacheQuery(this.task);
    stm.cache.set(this.key, this.task.data);
  } catch (error) {
    console.error(error);
  }
}

export function checkCache(task) {
  if (task.client.isTransaction()) {
    task.cache = null;
  } else {
    const key = stringify(task.values);
    const stm = task.client.statements.get(task.sql);

    if (stm?.cache?.has(key)) {
      task.data = stm.cache.get(key);
      return true;
    }

    task.cache = { key, task, save: saveCacheResult };
  }
  return false;
}
