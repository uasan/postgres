import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  // params: {
  //   timezone: 'America/New_York',
  // },
});

async function test() {
  const result = await db.query(
    `SELECT
      $1::date AS "now_date",
      $2::timestamp AS "now_timestamp",
      '2000-01-01T00:00:00Z'::timestamp AS "timestamp",
      '2000-01-01T00:00:00Z'::timestamptz AS "timestamptz",
      to_json('2000-01-01T00:00:00Z'::timestamp) AS timestamp_json,
      to_json('2000-01-01T00:00:00Z'::timestamptz) AS timestamptz_json
    `,
    [new Date(), new Date()]
  );

  console.log(JSON.parse(JSON.stringify(result)));

  await db.disconnect();
}

test().catch(console.error);
