import {
  NULL,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  INT16_ONE_ONE,
  MESSAGE_DESCRIBE,
  MESSAGE_FLUSH_END,
  PREPARED_QUERY,
  MESSAGES_EXEC_SYNC_FLUSH,
} from '../protocol/messages.js';

import { textEncoder } from '../utils/string.js';

function onErrorParse() {
  this.client.writer.sync().unlock();
  this.client.statements.delete(this.sql);
}

export class Statement {
  columns = [];
  decoders = [];
  encoders = [];

  countParams = 0;

  constructor(task) {
    const name = task.client.statements.size.toString(36);

    this.name = name;
    this.writer = task.client.writer;

    this.writer.lock();

    task.onError = onErrorParse;
    task.client.statements.set(task.sql, this);

    this.writer
      .type(MESSAGE_PARSE)
      .string(name)
      .string(task.sql)
      .setInt16(0)
      .end()
      .type(MESSAGE_DESCRIBE)
      .setUint8(PREPARED_QUERY)
      .string(name)
      .end()
      .setBytes(MESSAGE_FLUSH_END);
  }

  setParams(length) {
    this.countParams = length;
    this.params = new Uint8Array([
      0,
      ...textEncoder.encode(this.name),
      0,
      0,
      1,
      0,
      1,
      (length >>> 8) & 0xff,
      (length >>> 0) & 0xff,
    ]);

    return this;
  }

  execute(task) {
    const { values } = task;
    const { writer, encoders, countParams } = this;

    writer.type(MESSAGE_BIND).setBytes(this.params);

    let i = 0;

    try {
      for (; i < countParams; i++) {
        if (values[i] == null) {
          writer.setBytes(NULL);
        } else {
          encoders[i].encode(writer, values[i]);
        }
      }
    } catch (error) {
      let message = `Invalid value in param $${i + 1}::${encoders[i].name}`;

      if (error) {
        message += ': ' + error.message || error;
      }

      writer.clearLastMessage().sync();
      task.reject({ message, status: 422 });
      return this;
    }

    writer.setBytes(INT16_ONE_ONE).end().setBytes(MESSAGES_EXEC_SYNC_FLUSH);
    return this;
  }
}
