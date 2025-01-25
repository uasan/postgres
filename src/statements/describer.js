import { nullArray } from '#native';
import { PostgresError } from '../response/error.js';
import { makeErrorEncodeParameter } from '../utils/error.js';
import {
  MESSAGE_PARSE,
  MESSAGE_CLOSE,
  PREPARED_QUERY,
  MESSAGE_DESCRIBE,
} from '../protocol/messages.js';

export class Describer {
  task = null;
  isReady = false;

  columns = nullArray;
  decoders = nullArray;
  encoders = nullArray;

  constructor(task) {
    this.task = task;

    const statement = task.client.statements.get(task.sql);

    if (statement?.isReady) {
      this.columns = statement.columns;
      this.decoders = statement.decoders;
      this.encoders = statement.encoders;

      task.client.writer.sync();
      task.resolve(this);
    } else {
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

  onError(task) {
    task.client.writer.sync().unlock();
  }

  setParams(length) {
    if (length) {
      this.encoders = new Array(length);
    }
    return this;
  }

  onReady(task) {
    this.isReady = true;

    task.client.writer
      .type(MESSAGE_CLOSE)
      .setUint8(PREPARED_QUERY)
      .setUint8(0)
      .end()
      .sync()
      .unlock();

    task.resolve(this);
  }

  inlineSQL(source, values) {
    this.task.values = values;

    let sql = source[0];

    for (let i = 0; i < this.encoders.length; i)
      try {
        sql += this.encoders[i].getSQL(values[i]);
        sql += source[++i];
      } catch {
        throw new PostgresError(makeErrorEncodeParameter(this.task, i));
      }

    return sql;
  }
}
