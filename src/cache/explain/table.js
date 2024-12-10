export class TableExplain {
  name = '';
  schema = '';
  columns = new Set();

  constructor(context, schema, name) {
    this.name = name;
    this.schema = schema;

    context.tables.set(schema + '.' + name, this);
  }

  addColumn(name) {
    this.columns.add(name);
  }
}
