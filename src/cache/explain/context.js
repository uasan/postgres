import { explain } from './analyze.js';
import { reportNoCache } from './report.js';
import { CacheOrigin } from '../nodes/origin.js';
import { setColumns } from './columns.js';
import { setConditions } from './conditions.js';
import { setTablesPublications } from '../replica/publication.js';

class CacheContext {
  query = null;
  origin = null;
  table = null;

  isModifyTable = false;

  unTables = [];
  noCaches = [];

  tables = new Map();
  aliases = new Map();
  outputs = new Set();
  strings = new Map();
  conditions = new Set();

  constructor({ origin, options }, query) {
    this.query = query;
    this.origin = origin;
    origin.cache ??= new CacheOrigin(options);
  }

  setAlias(alias, schema, name) {
    const table = this.origin.getTable(schema, name);

    if (this.tables.has(table)) {
      this.tables.get(table).aliases.push(alias);
    } else {
      this.table ??= table;

      if (!table.oid && !this.unTables.includes(table)) {
        this.unTables.push(table);
      }

      this.tables.set(table, {
        table,
        column: null,
        context: this,
        aliases: [alias],
        columns: new Set(),
        conditions: new Map(),
      });
    }

    this.aliases.set(alias, table);
  }
}

export async function createCache(task, query) {
  const context = new CacheContext(task.client, query);

  explain(
    context,
    await task.client
      .prepare()
      .asValue()
      .execute(
        'EXPLAIN (VERBOSE true, FORMAT JSON, COSTS false, GENERIC_PLAN true)' +
          task.sql
      )
  );

  if (context.isModifyTable) {
    return;
  }

  if (context.unTables.length && context.noCaches.length === 0) {
    await setTablesPublications(context);
  }

  if (context.noCaches.length) {
    context.noCaches.forEach(reportNoCache);
    return;
  }

  if (context.table) {
    setColumns(context);
    setConditions(context);
  }

  task.statement.cache = query;
}
