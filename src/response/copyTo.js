import { noop } from '#native';

export function copyOutResponse(client) {
  client.task.resolve(
    new ReadableStream({
      type: 'bytes',

      start(controller) {
        client.task.resolve = () => {
          controller.close();
        };
        client.task.reject = error => {
          controller.error(error);
        };
        client.task.controller = controller;
      },

      pull() {
        client.reader.resume();
      },

      async cancel() {
        client.task.reject = noop;
        client.task.controller = null;
        await client.cancelRequest();
      },
    })
  );
}

export function copyData({ task, reader }) {
  if (task.controller) {
    task.controller.enqueue(reader.bytes.slice(reader.offset, reader.ending));

    if (task.controller.desiredSize <= 0) {
      reader.pause();
    }
  }
}

export function copyDone({ task, writer }) {
  writer.unlock();
  task.controller = null;
}
