import { CacheOrigin } from '../nodes/origin.js';
import { setRelations } from './relations.js';
import { setConditions } from './parser.js';
import { setTablesPublications } from '../replica/publication.js';
import { reportNoCache } from './report.js';

export class CacheContext {
  query = null;
  origin = null;
  tables = new Map();

  unTables = [];
  noCaches = [];

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
      if (!table.oid && !this.unTables.includes(table)) {
        this.unTables.push(table);
      }

      this.tables.set(table, new Set());
    }

    this.aliases.set(alias, table);
  }

  addTag(table, tag) {
    if (this.query.isTagged) {
      this.query.tags.push(tag);
    } else {
      this.query.tags = [tag];
      this.query.isTagged = true;
    }
    this.tables.get(table).add(tag);
    console.log(
      'CONDITION',
      table.name + '.' + tag.column.name,
      '=',
      tag.index
    );
  }

  static async analyze(task, query) {
    const context = new this(task.client, query);

    const plans = await task.client
      .prepare()
      .asValue()
      .execute(
        'EXPLAIN (VERBOSE true, FORMAT JSON, COSTS false, GENERIC_PLAN true)' +
          task.sql
      );

    setRelations(context, plans);

    if (context.unTables.length && context.noCaches.length === 0) {
      await setTablesPublications(context);
    }

    if (context.noCaches.length) {
      context.noCaches.forEach(reportNoCache);
    } else {
      setConditions(context);

      for (const [{ cache }, tags] of context.tables) {
        if (tags.size === 0) {
          cache.add(query);
        }
      }

      task.statement.cache = query;
    }

    // console.dir(plans, {
    //   depth: null,
    //   colors: true,
    // });
  }
}
