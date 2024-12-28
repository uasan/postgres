import { PostgresPool } from '../pool.js';
import Postgres from 'postgres';

const isPostgres = process.argv.slice(2)[0] === 'postgres';

const db = isPostgres
  ? new Postgres({
      max: 8,
      port: 5432,
      host: '127.0.0.1',
      username: 'postgres',
      password: 'pass',
      database: 'postgres',
    })
  : new PostgresPool({
      maxConnections: 8,
      port: 5432,
      host: '127.0.0.1',
      username: 'postgres',
      password: 'pass',
      database: 'postgres',
    });

const { performance } = globalThis;

const sql = `SELECT
  $1::int,
  $2::bool,
  $3::text,
  $4::uuid,
  $5::timestamptz`;

const values = [
  1,
  true,
  'ABC',
  'c5207a27-2614-4ed3-97e2-f3fdad40b3de',
  new Date(),
];

const query = isPostgres
  ? () => db.unsafe(sql, values, { prepare: true })
  : () => db.query(sql, values);

let count = 0;
let time = performance.now();

async function test() {
  while (true) {
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
  }
}

for (let i = 0; i < 1000; i++) test();
