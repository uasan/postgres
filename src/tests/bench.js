import { PostgresPool } from '../pool.js';
//import { PostgresClient } from '../client.js';
import Postgres from 'postgres';

const isPostgres = process.argv.slice(2)[0] === 'postgres';

const db = isPostgres
  ? new Postgres({
      max: 4,
      port: 5432,
      host: '127.0.0.1',
      username: 'postgres',
      password: 'pass',
      database: 'postgres',
    })
  : new PostgresPool({
      maxConnections: 4,
      port: 5432,
      host: '127.0.0.1',
      username: 'postgres',
      password: 'pass',
      database: 'postgres',
    });

const { performance } = globalThis;

let tasks = 0;
let count = 0;
let max = 100000;
let time = performance.now();

let params = ['A', 'B', 'C'];

const sql = `SELECT
  $1::text AS "1",
  $2::text AS "2",
  $3::text AS "3"`;

const query = isPostgres
  ? () => db.unsafe(sql, params, { prepare: true })
  : () => db.query(sql, params);

async function test() {
  const sendQuery = async () => {
    do {
      ++tasks;

      try {
        await query();
        count++;
      } catch (error) {
        console.error(error);
      }

      if (performance.now() - time >= 1000) {
        console.log('RPS', count);

        count = 0;
        time = performance.now();
      }
    } while (--tasks > max || sendQuery());
  };

  await sendQuery();
}

await test();
