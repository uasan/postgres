import { noop } from '#native';

export function resolveData() {
  this.resolve(this.data);
}

export function resolveCount() {
  this.resolve(this.count);
}

export function setNoData(task) {
  if (task.errorNoData) {
    task.reject(task.errorNoData);
  } else if (task.onReady === noop) {
    task.onReady = resolveData;

    if (task.cache) {
      task.cache.save();
    }
  }
}

export function setCountData(task, count) {
  if (task.errorNoData && count === '0') {
    task.reject(task.errorNoData);
  } else {
    task.count = Number(count);

    if (task.onReady === noop) {
      task.onReady = resolveCount;
    }
  }
}
