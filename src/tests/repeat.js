import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let sql = `
    SELECT repeat('A', (value * 1000 * random())::int)
    FROM generate_series(1, 1000) AS _(value)`;

  try {
    while (true) await db.query(sql, []);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
