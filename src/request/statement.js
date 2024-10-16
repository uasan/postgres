import {
  NULL,
  MESSAGE_SYNC,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  INT16_ONE_ONE,
  MESSAGE_DESCRIBE,
  MESSAGE_FLUSH_END,
  DESCRIBE_STATEMENT,
  MESSAGES_EXEC_SYNC_FLUSH,
} from '../protocol/messages.js';

import { textEncoder } from '../utils/string.js';

function onErrorParse() {
  this.client.writer.type(MESSAGE_SYNC).end().unlock();
  this.client.statements.delete(this.sql);
}

export class Statement {
  columns = [];
  decoders = [];

  constructor({ statements, writer }, task) {
    const { size } = statements;
    const name = size.toString(36);
    const {
      sql,
      values: { length },
    } = task;

    writer.lock();
    statements.set(sql, this);

    this.name = name;
    this.writer = writer;
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

    task.onError = onErrorParse;

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

  execute({ values, reject }) {
    const { writer, encoders } = this;
    writer.type(MESSAGE_BIND).setBytes(this.params);

    try {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const encode = encoders[i];

        if (value == null) writer.setBytes(NULL);
        else encode(writer, value);
      }
    } catch (error) {
      writer.clearLastMessage().type(MESSAGE_SYNC).end();
      reject(error);
      return this;
    }

    writer.setBytes(INT16_ONE_ONE).end().setBytes(MESSAGES_EXEC_SYNC_FLUSH);
    return this;
  }
}
