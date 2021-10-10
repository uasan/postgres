import { Client } from '../client.js';
import { FETCH_ONE } from '../constants.js';

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  console.log(
    await db.query(
      /* eslint-disable */
      `SELECT
        $1::text AS "digital",
        $1::numeric`,
      ['123456789.000023456789000000010'],
      FETCH_ONE
    )
  );
}

test().catch(console.error);
