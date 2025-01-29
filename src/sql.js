import { Task } from './task.js';

function concat(sql, source, values) {
  for (let i = 0; i < values.length; ) {
    if (typeof values[i]?.toSQL === 'function') {
      sql.source[sql.source.length - 1] +=
        values[i].toSQL(sql.context) + source[++i];
    } else {
      sql.values.push(values[i]);
      sql.source.push(source[++i]);
    }
  }
}

export class SQL {
  values = [];
  source = [];

  task = null;
  client = null;

  getTask() {
    return (this.task ??= new Task(this.client));
  }

  constructor(source, values, client) {
    this.client = client;

    this.source.push(source[0]);
    concat(this, source, values);
  }

  then(resolve, reject) {
    this.getTask().execute(this.toString(), this.values).then(resolve, reject);
    this.task = null;
    return this;
  }

  asTuples() {
    this.getTask().asTuples();
    return this;
  }

  asArrays() {
    this.getTask().asArrays();
    return this;
  }

  asArray() {
    this.getTask().asArray();
    return this;
  }

  asObjects() {
    this.getTask().asObjects();
    return this;
  }

  asObject() {
    this.getTask().asObject();
    return this;
  }

  asValue() {
    this.getTask().asValue();
    return this;
  }

  asLookup(deep = 1) {
    this.getTask().asLookup(deep);
    return this;
  }

  log() {
    console.log(this.toString(), this.values);
    return this;
  }

  toString() {
    const { source } = this;
    let text = source[0];

    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}
