import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  // host: '127.0.0.1',
  // port: 5432,
  // username: 'postgres',
  // password: 'pass',
  // database: 'postgres',
  host: '127.0.0.1',
  port: 9090,
  username: 'smartapps_db_master',
  password: '0IZrFJSHJF63cEX0oLXq',
  database: 'smartapps-v2',
});

async function test() {
  const task = db.prepare().asValue();

  //const sql = `SELECT * FROM ludicloud.users LIMIT 35`;
  const sql = `
    SELECT
      value,
      CASE WHEN value = 2 THEN 1 / (value - 3) ELSE null END
    FROM generate_series(1, 350) AS _(value)`;

  console.time('time');

  try {
    for await (const value of task.iterate(sql, [], 32)) {
      //console.log(value, 'VALUE');
    }
  } catch (error) {
    console.error(error);
  }

  //await task.execute(sql, []);

  console.timeEnd('time');
}

test().catch(console.error);
