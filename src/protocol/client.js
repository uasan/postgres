export class BaseClient {
  sendTask() {
    this.task =
      this.queue.dequeue() ??
      (this.isIsolated === false && this.pool?.queue.length
        ? this.pool?.queue.dequeueTo(this)
        : null);

    if (this.task === null) {
      this.isReady = true;

      if (this.waitReady) {
        this.waitReady.resolve();
        this.waitReady = null;
      }
    } else if (this.task.isSent === false) {
      this.task.send();
    }
  }
}
