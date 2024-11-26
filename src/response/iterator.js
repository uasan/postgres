import { PostgresError } from './error.js';

function onComplete() {
  this.resolve(false);
}

export async function* Iterator(task) {
  task.onComplete = onComplete;

  try {
    while (await task) {
      yield task.data;
      task.statement.next(task);
    }
  } catch (error) {
    throw new PostgresError(error);
  } finally {
    task.statement.end(task);
  }
}
