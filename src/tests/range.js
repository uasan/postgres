import { Pool } from '../pool.js';
import { FETCH_ONE_VALUE, TYPE_BLOB } from '../constants.js';

const db = new Pool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let sql = `
    SELECT 'empty'::int4range
  `;

  const params = [];

  try {
    console.log(await db.query(sql, params, FETCH_ONE_VALUE));
  } catch (error) {
    console.error(error);
  }
}

test();
