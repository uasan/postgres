function resolveData() {
  this.resolve(this.data);
}

export class SimpleQuery {
  columns = [];
  decoders = [];

  complete({ task }) {
    if (task.isData === false && task.errorNoData) {
      task.reject(task.errorNoData);
    } else {
      task.onReady = resolveData;
    }
  }

  onReady() {
    //
  }
}
