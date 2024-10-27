import { noop, nullArray } from '#native';
import { Query } from '../statements/query.js';
import { Describer } from '../statements/describer.js';

import {
  putData,
  pushData,
  setDataValue,
  setDataFields,
  setValueToArray,
} from '../response/data.js';
import { MESSAGE_QUERY } from '../protocol/messages.js';
import { PostgresError } from '../response/error.js';
import { createFileData } from '../response/file.js';
import { resolveCount } from '../response/state.js';

export class Task {
  sql = '';
  count = 0;

  isSent = false;
  isData = false;
  isCorked = false;
  isNoDecode = false;
  isDescribe = false;
  isSimpleQuery = false;

  next = null;
  file = null;
  client = null;
  statement = null;
  controller = null;
  errorNoData = null;
  unknownTypes = null;

  data = [];
  values = nullArray;

  reject = noop;
  resolve = noop;

  onReady = noop;
  onError = noop;
  onComplete = noop;

  addData = pushData;
  setData = setDataFields;

  constructor(client) {
    this.client = client;
  }

  async execute(sql, values) {
    this.sql = sql;

    if (this.client.stream === null) {
      this.client.connect().catch(noop);
    }

    if (values) {
      this.values = values;
    } else {
      this.isSimpleQuery = true;
    }

    if (this.client.task !== this) {
      if (this.client.task) {
        this.client.queue.enqueue(this);
      } else {
        this.client.task = this;
      }
    }

    try {
      return await this;
    } catch (error) {
      //throw error;
      throw new PostgresError(error);
    }
  }

  forceExecute(sql, values) {
    this.client.task = this;
    const promise = this.execute(sql, values);

    if (!this.isSent) this.send();

    return promise;
  }

  describe(sql) {
    this.isDescribe = true;
    return this.execute(sql, nullArray);
  }

  then(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;

    if (
      !this.isSent &&
      !this.client.writer.promise &&
      !this.client.writer.isLocked
    ) {
      this.send();
    }
  }

  send() {
    this.isSent = true;

    if (this.isSimpleQuery) {
      this.client.writer.type(MESSAGE_QUERY).string(this.sql).end();
    } else if (this.isDescribe) {
      if (this.statement) {
        this.statement.execute(this);
      } else {
        this.statement = new Describer(this);
      }
    } else {
      this.statement =
        this.client.statements.get(this.sql)?.execute(this) ?? new Query(this);
    }

    return this.next;
  }

  cork() {
    this.isCorked = true;
    return this;
  }

  uncork() {
    this.isCorked = false;

    if (this.client.writer.isLocked) {
      this.client.writer.unlock();
    }

    if (!this.isSent) {
      this.send();
    }

    return this;
  }

  onDescribe() {
    this.onError = noop;
    this.statement.execute(this);
    this.client.writer.unlock();
  }

  setErrorNoData(error) {
    this.errorNoData = error;
    return this;
  }

  setDataNoDecode() {
    this.isNoDecode = true;
    return this;
  }

  setDataAsArrayObjects() {
    this.data = [];
    this.addData = pushData;
    this.setData = setDataFields;
    return this;
  }

  setDataAsArrayValue() {
    this.data = [];
    this.addData = putData;
    this.setData = setValueToArray;
    return this;
  }

  setDataAsObject() {
    this.data = null;
    this.addData = putData;
    this.setData = setDataFields;
    return this;
  }

  setDataAsValue() {
    this.data = undefined;
    this.addData = noop;
    this.setData = setDataValue;
    return this;
  }

  setDataToFile(path) {
    this.file = { path, fd: 0 };

    this.onReady = resolveCount;
    this.setData = createFileData;

    this.isSimpleQuery = false;
    return this;
  }
}
