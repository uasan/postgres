import { noop } from '#native';
import { getData } from './data.js';
import { PostgresError } from './error.js';

function initData() {
  this.client.reader.pause();
  this.resolve(true);

  if (this.addData !== getData) {
    this.addData();
    this.addData = getData;
  }

  if (--this.count < 1) {
    this.count = this.limit;
    this.statement.next(this);
  }
}

function onComplete() {
  this.isDone = true;

  if (this.isData === false && this.errorNoData) {
    this.reject(this.errorNoData);
  } else {
    this.resolve(false);
  }
}

function onError(error) {
  throw error;
}

export async function* Iterator(task) {
  task.onComplete = onComplete;
  task.addData = task.initData;
  task.initData = initData;
  task.count = task.limit >> 1;

  try {
    while (await task) {
      yield task.data;

      task.isData = false;
      task.resolve = noop;
      task.reject = onError;
      task.client.reader.resume();

      while (task.isData) {
        yield task.data;

        task.isData = false;
        task.client.reader.resume();
      }

      if (task.isDone) {
        break;
      }
    }
  } catch (error) {
    throw new PostgresError(error);
  } finally {
    task.statement?.end(task);
  }
}
