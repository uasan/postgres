import { noop, nullArray } from '#native';
import { setComplete } from '../response/complete.js';
import { nextID, textEncoder } from '../utils/string.js';
import { makeErrorEncodeParameter } from '../utils/error.js';
import {
  NULL,
  MESSAGE_BIND,
  MESSAGE_PARSE,
  INT16_ONE_ONE,
  PREPARED_QUERY,
  MESSAGE_EXECUTE,
  MESSAGE_DESCRIBE,
  MESSAGES_EXEC_SYNC_FLUSH,
  MESSAGE_CLOSE,
} from '../protocol/messages.js';

export class Query {
  name = '';

  columns = nullArray;
  decoders = nullArray;
  encoders = nullArray;

  cache = null;
  isReady = false;
  params = nullArray;

  task = null;
  tasksWaitReady = null;

  getCountRows = noop;
  complete = setComplete;

  constructor(task) {
    this.task = task;
    this.name = nextID(task.client.options);

    task.client.queries.add(this);
    task.client.statements.set(task.sql, this);

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

  onError(task) {
    if (this.task === task) {
      this.task = null;

      if (this.tasksWaitReady) {
        for (const task of this.tasksWaitReady) {
          this.close(task);
        }
        this.tasksWaitReady = null;
      }

      task.client.statements.delete(task.sql);
    } else {
      this.tasksWaitReady?.delete(task);
    }

    task.client.writer.sync().unlock();
    task.client.queries.delete(this);
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

    if (length) {
      this.encoders = new Array(length);
    }

    return this;
  }

  adopt(task) {
    task.client.queries.add(this);
    task.client.writer
      .lock()
      .type(MESSAGE_PARSE)
      .string(this.name)
      .string(task.sql)
      .setInt16(0)
      .end()
      .flush();
  }

  onReady(task) {
    this.task = null;
    this.isReady = true;

    this.run(task);

    if (this.tasksWaitReady) {
      for (const task of this.tasksWaitReady) {
        this.run(task);
      }

      this.tasksWaitReady = null;
    }
  }

  run(task) {
    this.execute(task);

    if (task.limit === 0 && !task.isCorked) {
      task.client.writer.unlock();
    }
  }

  execute(task) {
    const { values } = task;
    const { encoders } = this;
    const { writer } = task.client;

    writer.type(MESSAGE_BIND).setBytes(this.params);

    for (let i = 0; i < encoders.length; i++) {
      if (values[i] == null) {
        writer.setBytes(NULL);
      } else {
        try {
          encoders[i].encode(writer, values[i]);
        } catch {
          writer.clearLastMessage().sync();
          task.reject(makeErrorEncodeParameter(task, i));
          return;
        }
      }
    }

    writer.setBytes(INT16_ONE_ONE).end();

    if (task.limit) {
      writer.lock();
      this.next(task);
    } else {
      writer.setBytes(MESSAGES_EXEC_SYNC_FLUSH);
    }
  }

  next(task) {
    task.client.writer
      .type(MESSAGE_EXECUTE)
      .setUint8(0)
      .setInt32(task.limit)
      .end()
      .flush();
  }

  end(task) {
    task.client.writer.sync().unlock();
  }

  close(task) {
    task.client.queries.delete(this);
    task.client.writer
      .type(MESSAGE_CLOSE)
      .setUint8(PREPARED_QUERY)
      .string(this.name)
      .end()
      .sync()
      .unlock();
  }
}
