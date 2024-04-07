import { ReadableStream, WritableStream } from 'node:stream/web';
import {
  MESSAGE_COPY_DATA,
  MESSAGE_COPY_DONE,
  MESSAGE_COPY_FAIL,
} from '../protocol/messages.js';

export function copyBothResponse() {
  //
}

export function copyInResponse({ task, writer }) {
  writer.lock();
  task.resolve(
    new WritableStream({
      start(controller) {
        task.reject = error => controller.error(error);
      },
      write: chunk =>
        typeof chunk === 'string'
          ? writer.type(MESSAGE_COPY_DATA).text(chunk).end().promise
          : writer.type(MESSAGE_COPY_DATA).setBytes(chunk).end().promise,
      close: async () => {
        writer.setBytes(MESSAGE_COPY_DONE).unlock();
        await task;
      },
      abort: (reason = 'abort') =>
        writer.type(MESSAGE_COPY_FAIL).string(reason).end(),
    })
  );
}

export function copyOutResponse({ task, cancelRequest }) {
  task.resolve(
    new ReadableStream({
      type: 'bytes',
      start(controller) {
        task.resolve = () => {
          controller.close();
        };
        task.reject = error => {
          controller.error(error);
        };
        task.controller = controller;
      },
      async cancel() {
        task.reject = null;
        task.controller = null;
        await cancelRequest();
      },
    })
  );
}

export function copyData({ task, reader }) {
  task.controller?.enqueue(reader.uint8.slice(reader.offset, reader.ending));
}

export function copyDone({ task, writer }) {
  writer.unlock();
  task.controller = null;
}
