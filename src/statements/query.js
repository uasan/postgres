import { nullArray } from '#native';
import {
  NULL,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  INT16_ONE_ONE,
  MESSAGE_DESCRIBE,
  PREPARED_QUERY,
  MESSAGES_EXEC_SYNC_FLUSH,
} from '../protocol/messages.js';
import { makeErrorEncodeParameter } from '../utils/error.js';

import { textEncoder } from '../utils/string.js';

export class Query {
  name = '';
  params = nullArray;

  columns = [];
  decoders = [];
  encoders = [];

  constructor(task) {
    task.client.statements.set(task.sql, this);

    this.name = task.client.statements.size.toString(36);

    task.client.writer
      .lock()
      .type(MESSAGE_PARSE)
      .string(this.name)
      .string(task.sql)
      .setInt16(0)
      .end()
      .type(MESSAGE_DESCRIBE)
      .setUint8(PREPARED_QUERY)
      .string(this.name)
      .end()
      .flush();
  }

  setParams(length) {
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
    const { writer } = task.client;

    const { encoders } = this;
    const { length } = encoders;

    writer.type(MESSAGE_BIND).setBytes(this.params);

    for (let i = 0; i < length; i++) {
      if (values[i] == null) {
        writer.setBytes(NULL);
      } else {
        try {
          encoders[i].encode(writer, values[i]);
        } catch (error) {
          writer.clearLastMessage().sync();
          task.reject(makeErrorEncodeParameter(task, error, i));
          return;
        }
      }
    }

    writer.setBytes(INT16_ONE_ONE).end().setBytes(MESSAGES_EXEC_SYNC_FLUSH);
  }
}
