import {
  VALUE_NULL,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  MESSAGE_FLUSH,
  MESSAGE_DESCRIBE,
  VALUE_INT16_ZERO,
  VALUE_DESCRIBE_STATEMENT,
  MESSAGES_EXEC_SYNC_FLUSH,
} from '../protocol/messages.js';
import { encodeTextInto } from '../utils/string.js';

export class Statement {
  constructor({ statements, writer }, task) {
    const { size } = statements;
    const name = size.toString(32);
    const {
      sql,
      reject,
      values: { length },
    } = task;

    const params = new Uint8Array(name.length + 6 + length * 2);

    this.name = name;
    this.writer = writer;
    this.params = params;
    this.columns = [];
    this.formats = VALUE_INT16_ZERO;
    this.decoders = [];
    this.encoders = new Array(length);

    encodeTextInto(name, params.subarray(1));
    const view = new DataView(params.buffer);
    view.setInt16(name.length + 2, length);
    view.setInt16(name.length + 4 + length * 2, length);

    statements.set(sql, this);

    task.reject = error => {
      statements.delete(sql);
      writer.unlock();
      reject(error);
    };

    const count = writer
      .type(MESSAGE_PARSE)
      .string(name)
      .string(sql)
      .setInt16(length).length;

    writer.alloc(length * 4).fill(0, count, writer.length);

    writer
      .end()
      .type(MESSAGE_DESCRIBE)
      .setInt8(VALUE_DESCRIBE_STATEMENT)
      .string(name)
      .end()
      .type(MESSAGE_FLUSH)
      .end();
  }

  execute(values) {
    const { writer, encoders } = this;
    writer.type(MESSAGE_BIND).binary(this.params);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      if (value === null) writer.binary(VALUE_NULL);
      else {
        const encode = encoders[i];
        encode(writer, value);
      }
    }

    writer.binary(this.formats).end().binary(MESSAGES_EXEC_SYNC_FLUSH).unlock();
    return this;
  }
}
