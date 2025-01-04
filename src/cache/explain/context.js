import { CacheOrigin } from '../nodes/origin.js';
import { CacheTable } from '../nodes/table.js';
import { setTablesPublications } from '../replica/publication.js';
import { setConditions, setRelations } from './relations.js';

export class CacheContext {
  origin = null;
  tables = new Map();
  unTables = [];

  aliases = new Map();
  outputs = new Set();
  conditions = new Set();

  constructor({ origin, options }) {
    this.origin = origin;
    origin.cache ??= new CacheOrigin(options);
  }

  setAlias(alias, schema, name) {
    const table = this.origin.getTable(schema, name);

    if (this.tables.has(table) === false) {
      table.cache ??= new CacheTable();

      if (!table.oid && !this.unTables.includes(table)) {
        this.unTables.push(table);
      }

      this.tables.set(table, new Map());
    }

    this.aliases.set(alias, table);
  }

  static async analyze(task, query) {
    const context = new this(task.client);

    const plans = await task.client
      .prepare()
      .setDataAsValue()
      .execute(
        'EXPLAIN (VERBOSE true, FORMAT JSON, COSTS false, GENERIC_PLAN true)' +
          task.sql
      );

    setRelations(context, plans);

    if (context.unTables.length) {
      await setTablesPublications(context);
    }

    setConditions(context);

    for (const [{ cache }, columns] of context.tables) {
      if (columns.size === 0) {
        cache.queries.add(query);
      }
    }

    // console.dir(plans, {
    //   depth: null,
    //   colors: true,
    // });
  }
}
