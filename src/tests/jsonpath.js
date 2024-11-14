import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  timeout: 3000,
});

async function test() {
  console.log(
    await db.query(
      `
      SELECT 
        jsonpath_send('$.*'::jsonpath) AS "expect",
        jsonpath_send($1::jsonpath) AS "actual",
        $1::jsonpath
      `,
      ['$.*']
    )
  );
}

await test();
