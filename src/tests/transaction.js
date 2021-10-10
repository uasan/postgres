import { Client } from '../client.js';

const db = new Client({
  size: 1,
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
  try {
    await db.transaction(async db => {
      const { pid } = db;
      console.log(await db.query(`SELECT 'INNER TRANSACTION'::text`));

      //pg_terminate_backend($1::int)

      await db.query(`SELECT $1::int / 0`, [pid]).catch(() => {});

      console.log(await db.query(`SELECT 2 AS q`));
    });
  } catch (error) {
    console.error(error);
  }

  console.log(await db.query(`SELECT 'AFTER TRANSACTION'::text`));
}

test();
