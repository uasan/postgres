import { Pool } from '../pool.js';
//import { Now } from '#native';
import Postgres from 'postgres';

const isPostgres = process.argv.slice(2)[0] === 'postgres';

const db = new (isPostgres ? Postgres : Pool)({
  max: 4,
  port: 5432,
  host: '127.0.0.1',
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

const { performance } = globalThis;
const getUtilization = () =>
  100 - Math.round(performance.eventLoopUtilization().utilization * 100);

let tasks = 0;
let count = 0;
let max = 100000;
let time = performance.now();

let params = ['A', 'B', 'C'];

const sql = `SELECT
  $1::text AS "1",
  $2::text AS "2",
  $3::text AS "3"`;

//const sql = `SELECT 1`;

const query = isPostgres
  ? () => db.unsafe(sql, params, { prepare: true })
  : () => db.query(sql, params);

async function test() {
  const sendQuery = async () => {
    do {
      ++tasks;
      await query();

      if (++count === max) {
        const now = performance.now();
        const sec = (now - time) / 1000;

        console.log('RPS', Math.round(max / sec), 'IDLE', getUtilization());
        count = 0;
        time = now;
      }
    } while (--tasks > max || sendQuery());
  };
  sendQuery();
}

await test();
