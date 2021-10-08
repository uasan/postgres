import { Client } from '../client.js';

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  // params: {
  //   timezone: 'Europe/Kiev',
  // },
});

async function test() {
  await db.transaction(async db => {
    const { pid } = db;
    console.log(await db.query(`SELECT to_json(now()::timestamptz) AS q`));

    //pg_terminate_backend($1::int)

    await db.query(`SELECT $1::int / 0`, [pid]).catch(() => {});

    console.log(await db.query(`SELECT 2 AS q`));
  });
}

test();
