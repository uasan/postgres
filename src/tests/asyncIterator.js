import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const task = db.prepare().setDataAsLookup(1);

  const sql = `
    SELECT
      value,
      'A' || value::text as "a",
      'B' || value::text as "b",
      'C' || value::text as "c",
      true as "d"
    FROM generate_series(1, 10) AS _(value)`;

  try {
    for await (const value of task.iterate(sql, [], 5)) {
      console.log(value);
    }
  } catch (error) {
    console.error(error);
  }

  console.log('DONE');
  console.log(await db.query('SELECT true AS query', []));
}

test().catch(console.error);
