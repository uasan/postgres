import { setRelations } from './relations.js';
import { TableExplain } from './table.js';

export class ContextExplain {
  tables = new Map();

  aliases = new Map();
  outputs = new Set();
  conditions = new Set();

  constructor(plans) {
    setRelations(this, plans);
  }

  setAlias(alias, schema, name) {
    this.aliases.set(
      alias,
      this.tables.get(schema + '.' + name) ??
        new TableExplain(this, schema, name)
    );
  }

  static async create(task) {
    const plans = await task.client
      .prepare()
      .setDataAsValue()
      .execute(
        'EXPLAIN (VERBOSE true, FORMAT JSON, COSTS false, GENERIC_PLAN true)' +
          task.sql
      );

    console.dir(plans, {
      depth: null,
      colors: true,
    });

    return new this(plans);
  }
}
