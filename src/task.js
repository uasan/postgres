import { noop, nullArray, nullObject } from '#native';

import { checkCache } from './cache/task.js';
import { Query } from './statements/query.js';
import { File } from './response/saveToFile.js';
import { Iterator } from './response/iterator.js';
import { PostgresError } from './response/error.js';
import { Describer } from './statements/describer.js';
import { MESSAGE_QUERY } from './protocol/messages.js';
import { getDescribeTable, makeCopyFromSQL } from './utils/copy.js';

import {
  getData,
  initArray,
  initObject,
  setDataValue,
  setDataFields,
  pushDataArray,
  setDataLookup,
  initObjectNull,
  pushDataObject,
  setDataEntries,
  setValueToArray,
} from './response/data.js';

export class Task {
  sql = '';

  count = 0;
  limit = 0;

  isSent = false;
  isData = false;
  isCorked = false;
  isNoDecode = false;
  isDescribe = false;
  isSimpleQuery = false;

  next = null;
  file = null;
  copy = null;
  cache = null;
  client = null;
  statement = null;
  controller = null;
  errorNoData = null;
  unknownTypes = null;

  data = nullArray;
  values = nullArray;

  reject = noop;
  resolve = noop;

  onReady = noop;
  onError = noop;
  onComplete = noop;

  initData = initArray;
  addData = pushDataObject;
  setData = setDataFields;

  constructor(client) {
    this.client = client;
  }

  async execute(sql, values) {
    this.sql = sql;

    if (values) {
      this.values = values;

      if (this.cache && checkCache(this)) {
        return this.data;
      }
    } else {
      this.isSimpleQuery = true;
    }

    if (this.client.task === null) {
      this.client.task = this;
      this.client.isReady = false;
    } else {
      this.client.queue.enqueue(this);
    }

    try {
      return await this;
    } catch (error) {
      //throw error;
      throw new PostgresError(error);
    }
  }

  forceExecute(sql, values) {
    if (this.client.task?.isSent === false) {
      this.client.queue.unshift(this.client.task);
    }

    this.isCorked = true;
    this.client.task = null;

    try {
      return this.execute(sql, values);
    } finally {
      this.send();
    }
  }

  then(resolve, reject) {
    this.reject = reject;
    this.resolve = resolve;

    if (this.client.stream === null) {
      this.client.connection.connect().catch(console.error);
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

    //console.log('SEND', this.sql.trim());

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

      if (this.client.queries.has(this.statement)) {
        this.statement.execute(this);
      } else {
        this.statement.adopt(this);
      }
    } else {
      this.statement = new Query(this);
    }

    if (this.isCorked) {
      this.client.writer.lock();
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
    } else if (!this.statement.isReady) {
      this.statement.onReady(this);
    }

    return this;
  }

  describe(sql) {
    this.isDescribe = true;
    return this.execute(sql, nullArray);
  }

  iterate(sql, values = nullArray, limit = 1) {
    if (limit === 1 && this.addData === pushDataObject) {
      this.setDataAsObject();
    }

    this.limit = limit;
    this.execute(sql, values);

    return Iterator(this);
  }

  setCache(options) {
    if (options === false) {
      this.cache = null;
    } else {
      this.cache = nullObject;
    }
    return this;
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
    this.initData = initArray;
    this.addData = pushDataObject;
    this.setData = setDataFields;
    return this;
  }

  setDataAsEntries() {
    this.initData = initArray;
    this.addData = pushDataArray;
    this.setData = setDataEntries;
    return this;
  }

  setDataAsEntry() {
    this.initData = initArray;
    this.addData = getData;
    this.setData = setDataEntries;
    return this;
  }

  setDataAsObject() {
    this.data = null;
    this.initData = initObject;
    this.addData = getData;
    this.setData = setDataFields;
    return this;
  }

  setDataAsLookup(deep = 1) {
    this.data = null;
    this.count = deep;
    this.initData = initObjectNull;
    this.addData = noop;
    this.setData = setDataLookup;
    return this;
  }

  setDataAsValues() {
    this.initData = initArray;
    this.addData = getData;
    this.setData = setValueToArray;
    return this;
  }

  setDataAsValue() {
    this.data = undefined;
    this.initData = noop;
    this.addData = noop;
    this.setData = setDataValue;
    return this;
  }

  setSaveToFile(path, options) {
    this.file = new File(this, path, options);
    return this;
  }

  async copyFrom(table, options) {
    this.copy = await new Task(this.client).describe(
      getDescribeTable(table, options?.columns)
    );
    return await this.execute(makeCopyFromSQL(table, options), nullArray);
  }
}
