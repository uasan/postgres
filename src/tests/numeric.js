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
  const value = '	.123400000000000';

  console.log(
    await db.query(
      /* eslint-disable */
      `SELECT
        ($1::text)::numeric AS "digital",
        $2::numeric`,
      [value, value],
      FETCH_ONE //| 16
    )
  );
}

test().catch(console.error);
