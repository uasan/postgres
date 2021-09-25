import { Client } from '../client.js';

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  await db.query(`SELECT 1`);

  const promise = db.query(`SELECT pg_sleep($1::int)`, [5]);
  promise.then(console.log, console.error);

  setTimeout(async () => await db.cancelRequest());
}

test();
