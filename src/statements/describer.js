import {
  MESSAGE_PARSE,
  MESSAGE_DESCRIBE,
  PREPARED_QUERY,
  MESSAGE_CLOSE,
} from '../protocol/messages.js';

function onErrorParse() {
  this.client.writer.sync().unlock();
}

export class Describer {
  columns = [];
  decoders = [];
  encoders = [];

  constructor(task) {
    if (task.client.statements.has(task.sql)) {
      task.client.writer.sync();
      task.resolve(task.client.statements.get(task.sql));
    } else {
      task.onError = onErrorParse;
      task.client.writer
        .lock()
        .type(MESSAGE_PARSE)
        .setUint8(0)
        .string(task.sql)
        .setInt16(0)
        .end()
        .type(MESSAGE_DESCRIBE)
        .setUint8(PREPARED_QUERY)
        .setUint8(0)
        .end()
        .flush();
    }
  }

  setParams() {
    return this;
  }

  execute(task) {
    task.client.writer
      .type(MESSAGE_CLOSE)
      .setUint8(PREPARED_QUERY)
      .setUint8(0)
      .end()
      .sync();

    task.resolve(this);
  }
}
