import { Pool } from '../pool.js';
import Postgres from 'postgres';

const isPostgres = process.argv.slice(2)[0] === 'postgres';

const db = new (isPostgres ? Postgres : Pool)({
  max: 1,
  port: 5432,
  no_prepare: false,
  host: '127.0.0.1',
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

db.query ??= db.unsafe;
const { performance } = globalThis;

let count = 0;
let loops = 0;
let max = 100000;
let time = performance.now();

let params = [
  1337,
  'wat',
  isPostgres ? new Date().toISOString() : new Date(),
  null,
  false,
  Buffer.from('awesome'),
  '[{ "some": "json" }, { "array": "object" }]',
];

async function test() {
  const sendQuery = async () => {
    loops++;

    for (let i = 0; i < max; i++) {
      await db.query(
        `SELECT
        $1::int AS int,
        $2::text AS string,
        $3::timestamp AS timestamp,
        $4::text AS null,
        $5::boolean AS boolean,
        $6::bytea AS bytea,
        $7::json AS json`,
        params
      );

      if (loops < max) sendQuery();

      if (++count === max) {
        const now = performance.now();
        const sec = (now - time) / 1000;

        console.log(
          'RPS',
          Math.round(max / sec),
          'IDLE',
          100 - Math.round(performance.eventLoopUtilization().utilization * 100)
        );
        count = 0;
        time = now;
      }
    }

    loops--;
  };

  queueMicrotask(sendQuery);
}

test();
