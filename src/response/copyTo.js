import { noop } from '#native';

function copyToStream({ reader }) {
  this.controller.enqueue(reader.bytes.slice(reader.offset, reader.ending));

  if (this.controller.desiredSize <= 0) {
    reader.pause();
  }
}

export function copyOutResponse(client) {
  client.task.setData = copyToStream;

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
        client.task.setData = noop;
        client.task.controller = null;
        await client.cancelRequest();
      },
    })
  );
}

export function copyData(client) {
  client.task.setData(client);
}

export function copyDone({ task }) {
  //task.setData = noop;
  task.controller = null;
}
