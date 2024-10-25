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

      async cancel() {
        client.task.reject = noop;
        client.task.controller = null;
        await client.cancelRequest();
      },
    })
  );
}

export function copyData({ task, reader }) {
  task.controller?.enqueue(reader.bytes.slice(reader.offset, reader.ending));
}

export function copyDone({ task, writer }) {
  writer.unlock();
  task.controller = null;
}
