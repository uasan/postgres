import { PostgresError } from '../response/error.js';
import {
  NULL,
  MESSAGE_COPY_DATA,
  MESSAGE_COPY_DONE,
  MESSAGE_COPY_FAIL,
  COPY_SIGN,
} from '../protocol/messages.js';
import { BUFFER_LENGTH } from '../constants.js';
import { makeErrorCopyFrom } from '../utils/copy.js';

export function copyBothResponse() {
  //
}
class UnderlyingSink {
  task = null;
  writer = null;

  constructor(task, writer) {
    this.task = task;
    this.writer = writer;
  }

  start(controller) {
    this.task.reject = controller.error.bind(controller);
  }

  write(chunk) {
    return this.writer.type(MESSAGE_COPY_DATA).setBytes(chunk).end().promise;
  }

  async abort(reason = 'Abort') {
    this.writer.type(MESSAGE_COPY_FAIL).string(reason).end();

    try {
      await this.task;
    } catch {
      this.writer.unlock();
    }
  }

  async close() {
    this.writer.setBytes(MESSAGE_COPY_DONE).unlock();

    try {
      await this.task;
    } catch (error) {
      throw new PostgresError(error);
    }
  }
}

class Writer {
  task = null;
  error = null;
  writer = null;

  isOpen = false;
  isClosed = false;

  constructor(task, writer) {
    this.task = task;
    this.writer = writer;

    task.onError = error => {
      this.error = error;
      console.log(error);
      this.writer.sync().unlock();
    };
  }

  async write(fields) {
    if (this.error) {
      throw new PostgresError(this.error);
    }

    const { writer } = this;
    const { columns, decoders: encoders } = this.task.copy;

    writer.type(MESSAGE_COPY_DATA);

    if (this.isOpen === false) {
      this.isOpen = true;
      writer.setBytes(COPY_SIGN);
    }

    writer.setInt16(columns.length);

    for (let i = 0; i < columns.length; i++) {
      const data = fields[columns[i]];

      if (data == null) writer.setBytes(NULL);
      else {
        try {
          encoders[i].encode(writer, data);
        } catch (error) {
          writer.clearLastMessage();
          await this.abort(makeErrorCopyFrom(this.task.copy, i, error, data));
          throw new PostgresError(this.error);
        }
      }
    }

    writer.end();

    if (writer.length > BUFFER_LENGTH) {
      await writer.promise;
    }
  }

  async abort(reason = 'Abort') {
    if (this.isClosed || this.error) return;

    this.writer.type(MESSAGE_COPY_FAIL).string(reason).end().unlock();

    try {
      await this.task;
    } catch (error) {
      this.error = error;
      this.isClosed = true;
    }
  }

  async close() {
    if (this.isClosed) {
      return;
    }

    if (this.error) {
      throw new PostgresError(this.error);
    }

    if (this.isOpen === false) {
      this.writer
        .type(MESSAGE_COPY_DATA)
        .setBytes(COPY_SIGN)
        .setInt16(-1)
        .end();
    }

    this.isClosed = true;
    this.writer.setBytes(MESSAGE_COPY_DONE).unlock();

    try {
      return await this.task;
    } catch (error) {
      throw new PostgresError(error);
    }
  }
}

export function copyInResponse({ task, writer }) {
  writer.lock();
  task.resolve(
    task.copy
      ? new Writer(task, writer)
      : new WritableStream(new UnderlyingSink(task, writer))
  );
}
