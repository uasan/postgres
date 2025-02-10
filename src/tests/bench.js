import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
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

let count = 0;
let time = performance.now();

async function test() {
  while (true) {
    try {
      await db.query(sql, values);
      count++;
    } catch (error) {
      console.error(error);
    }

    if (performance.now() - time > 1000) {
      console.log('RPS', count);

      // console.log(
      //   'QUEUE',
      //   db.queue.length,
      //   ...db.map(({ queue }) => queue.length)
      // );

      count = 0;
      time = performance.now();
    }
  }
}

for (let i = 0; i < 1000; i++) test();
