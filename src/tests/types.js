import { PostgresClient } from '../client.js';
import { Duration, PlainTime, PlainDate, Instant } from '#native';

const db = new PostgresClient({
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
    $7::text::numeric,
    $8::time,
    $9::date,
    $10::timestamptz,
    $11::interval,
    $12::uuid,
    $13::json,
    $14::int4[] AS "int4[]",
    $15::text[] AS "text[]",
    $16::uuid[] AS "uuid[]",
    $17::pg_lsn::text AS lsn,
    '{}'::text[] AS "empty[]",
    '2 years 1 months 2 weeks 3 hours 1 microseconds'::interval AS "intervalTest",
    $18::xid AS xid`;

  const values = [
    true,
    'Text 👍',
    123456789,
    9223372036854775807n,
    Math.PI,
    Math.PI,
    '92233720368547758070.92233720368547758070',
    PlainTime.from('23:59:59.999999'),
    PlainDate.from('2021-10-03'),
    Instant.from('2021-10-03T15:12:08.401928Z'),
    Duration.from('P1Y2M3W4DT5H6M7.987654321S'),
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
    25571522192n,
    4294967295,
  ];

  const result = await db.prepare().asObject().execute(sql, values);
  console.log(result);

  await db.disconnect();
}

await test();
