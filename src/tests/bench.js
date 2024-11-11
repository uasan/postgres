import { PostgresPool } from '../pool.js';
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

const sql = `SELECT
  $1::int AS "int",
  $2::bool AS "bool",
  $3::text AS "text",
  $4::timestamptz AS "timestamptz"`;

const params = [1, true, 'ABC', new Date()];

const query = isPostgres
  ? () => db.unsafe(sql, params, { prepare: true })
  : () => db.query(sql, params);

async function test() {
  let count = 0;
  let time = performance.now();

  const sendQuery = async () => {
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
  };

  for (let i = 0; i < 128; i++) sendQuery();
}

await test();
