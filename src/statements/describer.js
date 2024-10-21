import {
  MESSAGE_PARSE,
  MESSAGE_DESCRIBE,
  MESSAGE_FLUSH_END,
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
      .setBytes(MESSAGE_FLUSH_END);
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
