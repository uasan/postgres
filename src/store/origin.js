import { TypesMap } from '../protocol/types.js';
import { Table } from './table.js';

const databases = new Map();

export class Origin {
  schemas = new Map();
  relations = new Map();
  types = new TypesMap();

  setTable(schema, name) {
    const table = new Table();

    table.name = name;
    table.schema = schema;

    if (this.schemas.has(schema)) {
      this.schemas.get(schema).set(name, table);
    } else {
      this.schemas.set(schema, new Map().set(name, table));
    }

    return table;
  }

  getTable(schema, name) {
    return this.schemas.get(schema)?.get(name) ?? this.setTable(schema, name);
  }

  setRelation(oid, schema, name) {
    if (this.relations.has(oid)) {
      return this.relations.get(oid);
    }

    const table = this.getTable(schema, name);

    table.oid = oid;
    this.relations.set(oid, table);

    return table;
  }

  static get({ path, host, port, database }) {
    const key = (path || host + ':' + port) + '/' + database;

    if (databases.has(key)) {
      return databases.get(key);
    }

    const db = new this();
    databases.set(key, db);
    return db;
  }
}