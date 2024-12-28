import { stringify } from '../utils/string.js';
import { ContextExplain } from './explain/context.js';

async function saveCacheResult() {
  console.log('saveCacheResult', this.task.sql);

  this.task.statement.cache ??= new Map();
  this.task.statement.cache.set(this.key, this.task.data);

  const context = await ContextExplain.create(this.task);

  console.dir(context, {
    depth: null,
    colors: true,
  });
}

export function checkCache(task) {
  const key = stringify(task.values).slice(1, -1);
  const stm = task.client.statements.get(task.sql);

  if (stm?.cache?.has(key)) {
    task.data = stm.cache.get(key);
    return true;
  }

  task.cache = { key, task, save: saveCacheResult };
  return false;
}
