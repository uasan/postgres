import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const sqlA = db.sql`SELECT ${1} AS A, ${2}::bigint AS B`;

  const sqlB = db.sql`
    SELECT a.*, ${11} AS AA, ${22}::bigint AS BB
    FROM (${sqlA}) AS a
  `.log();

  console.log(await sqlB);
}

test().catch(console.error);
