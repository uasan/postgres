export const setCommit = client =>
  client.transactions > 1
    ? `RELEASE SAVEPOINT ${client.options.ns + --client.transactions}`
    : 'COMMIT';

export const setRollback = client =>
  client.transactions > 1
    ? `ROLLBACK TO SAVEPOINT ${client.options.ns + --client.transactions}`
    : 'ROLLBACK';

export const SELECT_TYPES = `SELECT
  a.oid,
  a.typarray AS array,
  n.nspname || '.' || a.typname AS name
FROM (
  SELECT DISTINCT CASE WHEN typelem != 0 THEN typelem ELSE oid END AS oid
  FROM pg_catalog.pg_type
  WHERE oid = ANY($1)
) AS _
JOIN pg_catalog.pg_type AS a USING(oid)
JOIN pg_catalog.pg_namespace AS n ON n.oid = a.typnamespace`;
