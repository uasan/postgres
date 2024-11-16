import { noop, nullArray } from '#native';
import { Query } from './statements/query.js';
import { Describer } from './statements/describer.js';

import {
  putData,
  pushData,
  setDataValue,
  setDataFields,
  setValueToArray,
} from './response/data.js';
import { File } from './response/saveToFile.js';
import { PostgresError } from './response/error.js';
import { MESSAGE_QUERY } from './protocol/messages.js';
import { getDescribeTable, makeCopyFromSQL } from './utils/copy.js';

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
  copy = null;
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
        this.client.isReady = false;
      }
    }

    try {
      return await this;
    } catch (error) {
      //throw error;
      throw new PostgresError(error);
    }
  }

  then(resolve, reject) {
    this.reject = reject;
    this.resolve = resolve;

    if (this.client.stream === null) {
      this.client.connect().catch(noop);
    }

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
    } else if (this.client.statements.has(this.sql)) {
      this.statement = this.client.statements.get(this.sql);
      this.statement.execute(this);
    } else {
      this.statement = new Query(this);
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

  onDescribe() {
    this.statement.execute(this);
    this.client.writer.unlock();
  }

  onErrorParse() {
    this.client.writer.sync().unlock();
    this.client.statements.delete(this.sql);
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

  setSaveToFile(path) {
    this.file = new File(this, path);
    return this;
  }

  async copyFrom(table, options) {
    this.copy = await new Task(this.client).describe(
      getDescribeTable(table, options?.columns)
    );

    return await this.execute(makeCopyFromSQL(table, options), nullArray);
  }
}
