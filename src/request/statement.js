import { textEncoder } from '../utils/string.js';
import {
  NULL,
  MESSAGE_SYNC,
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
    const name = size.toString(36);
    const {
      sql,
      reject,
      values: { length },
    } = task;

    writer.lock();
    statements.set(sql, this);

    this.name = name;
    this.writer = writer;
    this.columns = [];
    this.decoders = [];
    this.encoders = new Array(length);
    this.params = new Uint8Array([
      0,
      ...textEncoder.encode(name),
      0,
      0,
      1,
      0,
      1,
      (length >>> 8) & 0xff,
      (length >>> 0) & 0xff,
    ]);

    task.onDescribe = () => {
      task.reject = reject;
      this.execute(task.values);
      writer.unlock();
    };

    task.reject = error => {
      writer.type(MESSAGE_SYNC).end().unlock();
      statements.delete(sql);
      task.reject = reject;
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
      .setBytes(MESSAGE_FLUSH_END);
  }

  execute(values) {
    const { writer, encoders } = this;
    writer.type(MESSAGE_BIND).setBytes(this.params);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      if (value === null) writer.setBytes(NULL);
      else {
        encoders[i](writer, value);
      }
    }

    writer.setBytes(INT16_ONE_ONE).end().setBytes(MESSAGES_EXEC_SYNC_FLUSH);
    return this;
  }
}
