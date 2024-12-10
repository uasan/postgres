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
    const sql = `BEGIN;
    SET LOCAL random_page_cost TO 100000;

    --SET LOCAL enable_seqscan TO 0;
    --SET LOCAL enable_nestloop TO 0;
    
    --SET LOCAL from_collapse_limit TO 1;
    --SET LOCAL join_collapse_limit TO 1;
    
    EXPLAIN (VERBOSE true, FORMAT JSON, COSTS false, GENERIC_PLAN true)
    ${task.sql};
    ROLLBACK`;

    const plans = await task.client.prepare().setDataAsValue().execute(sql);

    console.dir(plans, {
      depth: null,
      colors: true,
    });

    return new this(plans);
  }
}
