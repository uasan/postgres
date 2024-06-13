import { nullArray } from '#native';
import { Statement } from './statement.js';
import {
  TYPE_NATIVE,
  FETCH_ALL,
  FETCH_ONE_VALUE,
  FETCH_VALUES,
} from '../constants.js';
import {
  putData,
  pushData,
  setDataValue,
  setDataFields,
  setValueToArray,
} from '../response/data.js';
import { noop } from '../utils/native.js';

export class Task {
  reject = null;
  resolve = null;
  statement = null;
  controller = null;

  constructor(
    client,
    sql,
    values = nullArray,
    flags = FETCH_ALL | TYPE_NATIVE
  ) {
    if (client.stream === null) client.connect().catch(noop);

    this.client = client;
    this.sql = sql;
    this.values = values;
    this.options = flags;
    this.data = flags & FETCH_ALL || flags & FETCH_VALUES ? [] : null;
    this.addData = flags & FETCH_ALL ? pushData : putData;
    this.setData =
      flags & FETCH_ONE_VALUE
        ? setDataValue
        : flags & FETCH_VALUES
          ? setValueToArray
          : setDataFields;

    //console.log('TASK', sql);

    if (client.task) client.queue.enqueue(this);
    else client.task = this;
  }

  then(resolve, reject) {
    if (this.resolve === null) {
      this.resolve = resolve;
      this.reject = reject;

      if (
        this.client.writer.promise === null &&
        this.client.writer.isLocked === false
      ) {
        this.send();
      }
    } else {
      this.resolve = resolve;
      this.reject = reject;
    }
  }

  send() {
    //console.log('SEND', this.sql);
    this.statement =
      this.client.statements.get(this.sql)?.execute(this.values) ??
      new Statement(this.client, this);

    return this.next;
  }

  onReady() {}
}
