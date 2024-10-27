import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  //let sql = `SELECT ($1::tsquery)::text AS in`;

  let sql = `SELECT
    $$'a' & 'b' & 'c':*$$::tsquery AS out,
    ($1::tsquery)::text AS in`;

  const params = [`'a' & 'b' & 'c':*`];

  try {
    const result = await db.query(sql, params);

    console.log('IN', result[0].in);
    console.log('OUT', result[0].out);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
