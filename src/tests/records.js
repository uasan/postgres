import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let sql = `SELECT _ FROM (values($1::int, $2::text)) _`;

  const params = [10, 'AAA'];

  try {
    console.log(await db.query(sql, params));
  } catch (error) {
    console.error(error);
  }
}

await test();
