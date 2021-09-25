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
  const sql = `SELECT
    $1::bool,
    $2::text,
    $3::int,
    $4::int8,
    $5::float4,
    $6::float8,
    $7::numeric,
    $8::timestamptz,
    $9::interval,
    $10::uuid,
    $11::json,
    $12::int4[] AS "int4[]",
    $13::text[] AS "text[]",
    $14::uuid[] AS "uuid[]"`;

  const params = [
    true,
    'Text',
    123456789,
    BigInt('9223372036854775807'),
    Math.PI,
    Math.PI,
    '9223372036854775807' + Math.PI,
    new Date(),
    '1 years 2 mons 3 days 4 hours 5 mins 6 secs',
    'c5207a27-2614-4ed3-97e2-f3fdad40b3de',
    { key: 'value' },
    [1, 2, 3],
    [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    ],
    [
      'c5207a27-2614-4ed3-97e2-f3fdad40b3de',
      'c5207a27-2614-4ed3-97e2-f3fdad40b3de',
    ],
  ];

  console.log(await db.query(sql, params, FETCH_ONE));
}

test();
