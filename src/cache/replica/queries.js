import { quoteString } from '../../utils/string.js';

export const getTablesName = table => table.getName();
export const getColsName = column => '"' + column.name + '"';

export function selectTableMeta(origin, tables) {
  return `SELECT json_agg(_.*) FROM (
  SELECT
    t.oid::bigint,
    pg_catalog.pg_snapshot_xmin(pg_catalog.pg_current_snapshot())::text::json AS xid,
    bool_and(t.logged) AS "isLogged",
    bool_and(t.ordinary) AS "isOrdinary",
    bool_and(p.oid IS NOT NULL) AS "isPub",
    bool_and(pr.prpubid IS NOT NULL) AS "isPubTable",
    bool_and(pr.prattrs = i.indkey) IS TRUE AS "isPubColumns", 
    json_agg(json_build_object(
      'name',  c.attname,
      'type',  c.atttypid::bigint,
      'isKey', i.indrelid IS NOT NULL OR t.relreplident = 'f'
    ) ORDER BY c.attnum) AS cols
  FROM (
    SELECT t.oid, t.relreplident, n.pos, t.relpersistence = 'p' AS logged, t.relkind = 'r' AS ordinary
    FROM pg_catalog.pg_class AS t
    JOIN pg_catalog.pg_namespace AS s ON s.oid = t.relnamespace
    JOIN unnest(ARRAY['${tables.map(getTablesName).join("','")}']::regclass[]) WITH ORDINALITY AS n(oid, pos) ON n.oid = t.oid
  ) AS t
  LEFT JOIN pg_catalog.pg_attribute AS c ON c.attrelid = t.oid AND c.attnum > 0 AND c.atttypid > 0
  LEFT JOIN pg_catalog.pg_index AS i ON i.indrelid = t.oid AND c.attnum = ANY(i.indkey) AND (i.indisreplident OR (i.indisprimary AND t.relreplident = 'd'))
  LEFT JOIN pg_catalog.pg_publication AS p ON p.pubname = ${quoteString(origin.cache.publication)}
  LEFT JOIN pg_catalog.pg_publication_rel AS pr ON pr.prpubid = p.oid AND pr.prrelid = t.oid
  GROUP BY t.oid, t.pos
  ORDER BY t.pos
 ) _`;
}
