import { Pool } from '../pool.js';
//import { Client } from '../client.js';
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
  : new Pool({
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

const sqlTerminate = 'SELECT pg_terminate_backend(pg_backend_pid())';

const query = isPostgres
  ? () => db.unsafe(sql, params, { prepare: true })
  : () => db.query(sql, params);

const queryTerminate = isPostgres
  ? () => db.unsafe(sqlTerminate).catch(console.error)
  : () => db.query(sqlTerminate).catch(console.error);

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

  //setInterval(queryTerminate, 500);
  await sendQuery();
}

await test();
