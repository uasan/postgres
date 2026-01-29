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
  setDataLookup,
  initObjectNull,
  pushDataObject,
  setDataArrays,
  setTuples,
  setDataArray,
  initFixedArray,
} from './response/data.js';

export class Task {
  sql = '';

  count = 0;
  limit = 0;

  isSent = false;
  isData = false;
  isDone = false;
  isCorked = false;
  isNoDecode = false;
  isDescribe = false;
  isSimpleQuery = false;
  isForceExecute = false;

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
    } else if (this.isForceExecute) {
      this.client.queue.unshift(this);
    } else {
      this.client.queue.enqueue(this);
    }

    try {
      return await this;
    } catch (error) {
      //throw error;
      throw error && new PostgresError(error);
    }
  }

  forceExecute(sql, values) {
    this.isForceExecute = true;

    if (this.client.task?.isDone) {
      this.client.task = null;
    }

    return this.execute(sql, values);
  }

  then(resolve, reject) {
    this.reject = reject;
    this.resolve = resolve;

    if (this.client.stream === null) {
      this.client.connection.connect().catch(noop);
    }

    if (!this.isSent && this.client.task === this) {
      this.send();
    }
  }

  send() {
    this.isSent = true;

    // console.trace(
    //   'SEND',
    //   this.sql?.trim?.().replace(/\s+/g, ' ').slice(0, 80),
    //   this.values
    // );

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
  }

  describe(sql) {
    this.isDescribe = true;
    return this.execute(sql, nullArray);
  }

  iterate(sql, values = nullArray, limit = 16) {
    if (limit === 1 && this.addData === pushDataObject) {
      this.asObject();
    }

    this.limit = limit;
    this.execute(sql, values);

    return Iterator(this);
  }

  cork() {
    this.isCorked = true;
    return this;
  }

  uncork() {
    this.isCorked = false;
    this.client.sendTask();
    return this;
  }

  useCache(options) {
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

  asObjects() {
    this.initData = initArray;
    this.addData = pushDataObject;
    this.setData = setDataFields;
    return this;
  }

  asObject() {
    this.data = null;
    this.initData = initObject;
    this.addData = getData;
    this.setData = setDataFields;
    return this;
  }

  asArrays() {
    this.initData = initArray;
    this.addData = noop;
    this.setData = setDataArrays;
    return this;
  }

  asArray() {
    this.initData = initFixedArray;
    this.addData = noop;
    this.setData = setDataArray;
    return this;
  }

  asTuples() {
    this.initData = initArray;
    this.addData = noop;
    this.setData = setTuples;
    return this;
  }

  asLookup(deep = 1) {
    this.data = null;
    this.count = deep;
    this.initData = initObjectNull;
    this.addData = noop;
    this.setData = setDataLookup;
    return this;
  }

  asValue() {
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
      getDescribeTable(table, options?.columns),
    );
    return await this.execute(makeCopyFromSQL(table, options), nullArray);
  }

  cancel() {
    if (this.isDone === false) {
      if (this.isSent) this.client.cancelRequest();
      else this.client.queue.delete(this);

      this.isDone = true;
      this.reject();
    }
  }

  error(error) {
    if (this.statement?.isReady === false) {
      this.statement.onError(this);
    }
    this.isDone = true;
    this.onError(error);
    this.reject(error);
  }
}
