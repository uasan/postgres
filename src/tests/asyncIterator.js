import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const task = db.prepare();

  const sql = `
    SELECT value
    FROM generate_series(1, 10) AS _(value)`;

  let count = 0;

  try {
    for await (const value of task.iterate(sql, [], 3)) {
      console.log(++count, value);
    }
  } catch (error) {
    console.error(error);
  }

  console.log('DONE');
  console.log(await db.query('SELECT true AS query', []));
}

test().catch(console.error);
