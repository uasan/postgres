import { explain } from './analyze.js';
import { reportNoCache } from './report.js';
import { CacheOrigin } from '../nodes/origin.js';
import { setColumns, setConditions } from './parser.js';
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
  conditions = new Set();

  constructor({ origin, options }, query) {
    this.query = query;
    this.origin = origin;
    origin.cache ??= new CacheOrigin(options);
  }

  setAlias(alias, schema, name) {
    const table = this.origin.getTable(schema, name);

    if (this.tables.has(table) === false) {
      this.table ??= table;

      if (!table.oid && !this.unTables.includes(table)) {
        this.unTables.push(table);
      }

      this.tables.set(table, {
        ors: new Set(),
        ands: new Set(),
        columns: new Set(),
        conditions: new Set(),
      });
    }

    this.aliases.set(alias, table);
  }

  addCondition(sql) {
    this.conditions.add(sql.slice(1, -1));
  }

  addTag(table, tag) {
    if (this.query.isTagged) {
      this.query.tags.push(tag);
    } else {
      this.query.tags = [tag];
      this.query.isTagged = true;
    }
    this.tables.get(table).conditions.add(tag);
    // console.log(
    //   'CONDITION',
    //   table.name + '.' + tag.column.name,
    //   '=',
    //   tag.index
    // );
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

    for (const [{ cache }, { conditions }] of context.tables) {
      if (conditions.size === 0) {
        cache.add(query);
      }
    }
  }

  task.statement.cache = query;
}
