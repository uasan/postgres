import { stringify } from '../utils/string.js';
import { CacheQuery } from './nodes/query.js';

function saveCacheResult() {
  if (this.task.statement.cache?.has(this.key)) {
    return;
  }

  const stm = this.task.statement;

  try {
    stm.cache ??= CacheQuery.create(this.task);

    stm.cache.save(this, this.task.data);
  } catch (error) {
    console.error(error);
  }
}

export function checkCache(task) {
  if (task.client.isTransaction()) {
    task.cache = null;
  } else {
    const key = stringify(task.values);
    const result = task.client.statements.get(task.sql)?.cache?.get(key);

    if (result) {
      result.hit++;
      task.data = result.data;

      return true;
    } else if (result === null) {
      task.cache = null;
    } else {
      task.cache = { key, task, save: saveCacheResult };
    }
  }
  return false;
}
