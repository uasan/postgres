import { Pool } from '../pool.js';
import { FETCH_ONE_VALUE } from '../constants.js';

const db = new Pool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const sql = `SELECT 'empty'::int4range`;
  const params = [];

  await db.query(sql, params, FETCH_ONE_VALUE);
}

test();
