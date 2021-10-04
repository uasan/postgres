import { Pool } from '../pool.js';
import { Now } from '#native';
import Postgres from 'postgres';

const isPostgres = process.argv.slice(2)[0] === 'postgres';

const db = new (isPostgres ? Postgres : Pool)({
  max: 1,
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

let params = [
  1337,
  'wat',
  isPostgres ? new Date().toISOString() : Now.instant(),
  null,
  false,
  Buffer.from('awesome'),
  '[{ "some": "json" }, { "array": "object" }]',
];

const sql = `SELECT
  $1::int AS int,
  $2::text AS string,
  $3::timestamp AS timestamp,
  $4::text AS null,
  $5::boolean AS boolean,
  $6::bytea AS bytea,
  $7::json AS json`;

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
