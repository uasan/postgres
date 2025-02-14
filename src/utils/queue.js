export class Queue {
  length = 0;
  head = null;
  tail = null;

  enqueue(task) {
    if (this.length++) this.tail.next = task;
    else this.head = task;

    this.tail = task;
  }

  dequeue() {
    if (this.length === 0) return null;

    const task = this.head;

    if (--this.length) {
      this.head = task.next;
    } else {
      this.head = null;
      this.tail = null;
    }

    task.next = null;
    return task;
  }

  dequeueTo(client) {
    this.head.client = client;
    return this.dequeue();
  }

  unshift(task) {
    if (this.length++) {
      task.next = this.head;
    } else {
      this.tail = task;
    }

    this.head = task;
  }

  delete(task) {
    if (task.prev && task.next) {
      task.prev.next = task.next;
    } else if (task.prev) {
      this.tail = task.prev;
    } else if (task.next) {
      this.head = task.next;
    }

    task.prev = null;
    task.next = null;
  }
}
