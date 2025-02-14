import { noop } from '#native';
import { PostgresError } from '../response/error.js';
import { BUFFER_LENGTH } from '../constants.js';
import { makeErrorCopyFrom } from '../utils/copy.js';
import {
  NULL,
  COPY_SIGN,
  MESSAGE_COPY_DATA,
  MESSAGE_COPY_DONE,
  MESSAGE_COPY_FAIL,
} from '../protocol/messages.js';

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
      //
    }
  }

  async close() {
    this.writer.type(MESSAGE_COPY_DONE).end().sync().flush();

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

  isWrited = false;
  isClosed = false;

  constructor(task, writer) {
    this.task = task;
    this.writer = writer;

    task.onError = error => {
      if (this.isClosed === false) this.close().catch(noop);
      this.error = error;
    };
  }

  async write(fields) {
    if (this.error) {
      throw new PostgresError(this.error);
    }

    if (this.isClosed) {
      throw PostgresError.of('Writer closed');
    }

    const { writer } = this;
    const { columns, decoders: encoders } = this.task.copy;

    writer.type(MESSAGE_COPY_DATA);

    if (this.isWrited === false) {
      this.isWrited = true;
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
          await this.abort(makeErrorCopyFrom(this, error, data, i));
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

    this.writer.type(MESSAGE_COPY_FAIL).string(String(reason)).end();

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

    if (this.isWrited === false) {
      this.writer
        .type(MESSAGE_COPY_DATA)
        .setBytes(COPY_SIGN)
        .setInt16(-1)
        .end();
    }

    this.isClosed = true;
    this.writer.type(MESSAGE_COPY_DONE).end().sync().flush();

    try {
      return await this.task;
    } catch (error) {
      throw new PostgresError(error);
    }
  }
}

export function copyInResponse({ task, writer }) {
  task.resolve(
    task.copy
      ? new Writer(task, writer)
      : new WritableStream(new UnderlyingSink(task, writer))
  );
}
