export function selectTablePub(tables) {
  return `SELECT json_agg(_.*) FROM (
  SELECT
    t.oid::bigint,
    t.schema,
    t.name,
    p.oid IS NOT NULL AS "isPub",
    pr.prpubid IS NOT NULL AS "isPubTable",
    pr.prattrs = i.indkey AS "isPubColumns", 
    json_agg(json_build_object(
      'name',  c.attname,
      'type',  c.atttypid::bigint,
      'isKey', i.indrelid IS NOT NULL OR t.relreplident = 'f'
    ) ORDER BY c.attnum) AS columns
  FROM (
    SELECT t.oid, t.relreplident, s.nspname AS schema, t.relname AS name
    FROM pg_catalog.pg_class AS t
    JOIN pg_catalog.pg_namespace AS s ON s.oid = t.relnamespace
    WHERE t.oid IN ('${tables.join("'::regclass,'")}'::regclass)
  ) AS t
  LEFT JOIN pg_catalog.pg_attribute AS c ON c.attrelid = t.oid AND c.attnum > 0 AND c.atttypid > 0
  LEFT JOIN pg_catalog.pg_index AS i ON i.indrelid = t.oid AND c.attnum = ANY(i.indkey) AND (i.indisreplident OR (i.indisprimary AND t.relreplident = 'd'))
  LEFT JOIN pg_catalog.pg_publication AS p ON p.pubname = 'cache'
  LEFT JOIN pg_catalog.pg_publication_rel AS pr ON pr.prpubid = p.oid AND pr.prrelid = t.oid
  GROUP BY t.oid, p.oid, t.schema, t.name
 ) _`;
}
