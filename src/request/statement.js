import { textEncoder } from '../utils/string.js';
import {
  NULL,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  MESSAGE_DESCRIBE,
  MESSAGE_FLUSH_END,
  INT16_ONE_ONE,
  DESCRIBE_STATEMENT,
  MESSAGES_EXEC_SYNC_FLUSH,
} from '../protocol/messages.js';

export class Statement {
  constructor({ statements, writer }, task) {
    const { size } = statements;
    const name = size.toString(32);
    const {
      sql,
      reject,
      values: { length },
    } = task;

    statements.set(sql, this);

    this.name = name;
    this.writer = writer;
    this.columns = [];
    this.decoders = [];
    this.encoders = new Array(length);
    this.params = new Uint8Array([
      /* eslint-disable */
      0, ...textEncoder.encode(name), 0, 0, 1, 0, 1, (length >>> 8) & 0xff, (length >>> 0) & 0xff
    ]);

    task.reject = error => {
      statements.delete(sql);
      writer.unlock();
      reject(error);
    };

    writer
      .type(MESSAGE_PARSE)
      .string(name)
      .string(sql)
      .setInt16(0)
      .end()
      .type(MESSAGE_DESCRIBE)
      .setInt8(DESCRIBE_STATEMENT)
      .string(name)
      .end()
      .binary(MESSAGE_FLUSH_END);
  }

  execute(values) {
    const { writer, encoders } = this;
    writer.type(MESSAGE_BIND).binary(this.params);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      if (value === null) writer.binary(NULL);
      else {
        const encode = encoders[i];
        encode(writer, value);
      }
    }

    writer.binary(INT16_ONE_ONE).end().binary(MESSAGES_EXEC_SYNC_FLUSH).unlock();
    return this;
  }
}
