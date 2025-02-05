export class SQL {
  values = [];
  source = [];

  task = null;
  client = null;

  constructor(source, values, client) {
    this.client = client;
    this.source.push(source[0]);

    for (let i = 0; i < values.length; ) {
      if (typeof values[i]?.injectSQL === 'function') {
        values[i].injectSQL(this, source[++i]);
      } else {
        this.values.push(values[i]);
        this.source.push(source[++i]);
      }
    }
  }

  getTask() {
    return (this.task ??= this.client.prepare());
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

  injectSQL({ source, values }, string) {
    source[source.length - 1] += this.source[0];

    for (let i = 0; i < this.values.length; ) {
      values.push(this.values[i]);
      source.push(this.source[++i]);
    }

    source[source.length - 1] += string;
  }

  toString() {
    const { source } = this;
    let text = source[0];

    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}
