import { Column } from './column.js';

export class Table {
  oid = 0;
  cache = null;

  name = '';
  schema = '';

  keys = [];
  cols = [];
  columns = new Map();

  setColumn(name) {
    const column = new Column();

    column.name = name;
    this.columns.set(name, column);

    return column;
  }

  getColumn(name) {
    return this.columns.get(name) ?? this.setColumn(name);
  }

  getName() {
    return `"${this.schema}"."${this.name}"`;
  }
}
