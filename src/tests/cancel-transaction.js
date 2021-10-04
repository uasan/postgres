import { Client } from '../client.js';

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  await db.transaction(async db => {
    const { pid } = db;
    console.log(await db.query(`SELECT 1 AS q`));

    await db
      .query(`SELECT pg_terminate_backend($1::int)`, [pid])
      .catch(() => console.log('terminate'));

    console.log(await db.query(`SELECT 2 AS q`));
  });
}

test();
