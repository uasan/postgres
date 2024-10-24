import {
  MESSAGE_COPY_DATA,
  MESSAGE_COPY_DONE,
  MESSAGE_COPY_FAIL,
} from '../protocol/messages.js';

export function copyBothResponse() {
  //
}

function startStream(controller) {
  this.task.reject = controller.error.bind(controller);
}

function writeString(chunk) {
  return this.writer.type(MESSAGE_COPY_DATA).text(chunk).end().promise;
}

function writeBuffer(chunk) {
  return this.writer.type(MESSAGE_COPY_DATA).setBytes(chunk).end().promise;
}

function startWrite(chunk) {
  switch (chunk.constructor) {
    case String:
      this.write = writeString;
      break;

    case Buffer:
    case Uint8Array:
      this.write = writeBuffer;
      break;
  }

  return this.write(chunk);
}

async function closeStream() {
  this.writer.setBytes(MESSAGE_COPY_DONE).unlock();
}

function abortStream(reason = 'abort') {
  this.writer.type(MESSAGE_COPY_FAIL).string(reason).end();
}

export function copyInResponse({ task, writer }) {
  writer.lock();
  task.resolve(
    new WritableStream({
      task,
      writer,
      start: startStream,
      write: startWrite,
      close: closeStream,
      abort: abortStream,
    })
  );
}
