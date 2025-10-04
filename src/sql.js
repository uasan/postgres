export class SQL {
  values = [];
  source = [];

  task = null;
  client = null;

  constructor(client) {
    this.client = client;
  }

  getTask() {
    return (this.task ??= this.client.prepare());
  }

  set(source, values) {
    if (this.source.length) {
      this.source[this.source.length - 1] += source[0];
    } else {
      this.source.push(source[0]);
    }

    for (let i = 0; i < values.length; ) {
      if (typeof values[i]?.injectSQL === 'function') {
        values[i].injectSQL(this, source[++i]);
      } else {
        this.values.push(values[i]);
        this.source.push(source[++i]);
      }
    }

    return this;
  }

  sql(source, ...values) {
    return this.set(source, values);
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

  builder() {
    const builder = new SQLBuilder(this.client);

    builder.parts[0].source = this.source;
    builder.parts[0].values = this.values;

    return builder;
  }

  injectSQL({ source, values }, string) {
    source[source.length - 1] += this.source[0];

    for (let i = 0; i < this.values.length; ) {
      values.push(this.values[i]);
      source.push(this.source[++i]);
    }

    source[source.length - 1] += string;
  }

  make() {
    return this;
  }

  toString() {
    const { source } = this.make();
    let text = source[0];

    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}

class Parts extends Array {
  add(command, delimiter = '') {
    this.push({
      command,
      delimiter,
      source: [],
      values: [],
    });
    return this;
  }
}

export class SQLBuilder extends SQL {
  parts = new Parts()
    .add('WITH', ',\n')
    .add('SELECT', ', ')
    .add('FROM')
    .add('JOIN', '\nJOIN ')
    .add('LEFT JOIN', '\nLEFT JOIN ')
    .add('RIGHT JOIN', '\nRIGHT JOIN ')
    .add('CROSS JOIN', '\nCROSS JOIN ')
    .add('FULL JOIN', '\nFULL JOIN ')
    .add('WHERE', ' AND ')
    .add('GROUP BY', ', ')
    .add('HAVING', ', ')
    .add('ORDER BY', ', ')
    .add('LIMIT')
    .add('OFFSET');

  sql(source, ...values) {
    source = [...source];
    const sql = source[0].trimStart();

    for (let i = 0; i < this.parts.length; i++) {
      if (sql.startsWith(this.parts[i].command)) {
        const part = this.parts[i];

        this.source = part.source;
        this.values = part.values;

        if (part.source.length) {
          source[0] =
            part.delimiter + sql.slice(part.command.length).trimStart();
        } else {
          source[0] = sql;
        }

        return this.set(source, values);
      }
    }

    throw new Error('Unknown SQL build command: ' + sql);
  }

  make() {
    this.source = [];
    this.values = [];

    for (let i = 0; i < this.parts.length; i++) {
      if (this.parts[i].source.length) {
        if (this.source.length) {
          this.source[this.source.length - 1] += '\n' + this.parts[i].source[0];
          this.source.push(...this.parts[i].source.slice(1));
        } else {
          this.source.push(...this.parts[i].source);
        }

        this.values.push(...this.parts[i].values);
      }
    }

    return this;
  }

  builder() {
    return new SQLBuilder(this.client);
  }
}
