import { Client } from '../client.js';

const db = new Client({
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
  await db.query(`SET TimeZone = 'America/New_York'`);

  console.log(
    await db.query(`SELECT
      '2000-01-01T00:00:00Z'::timestamp AS "timestamp",
      '2000-01-01T00:00:00Z'::timestamptz AS "timestamptz",
      to_json('2000-01-01T00:00:00Z'::timestamp) AS timestamp_json,
      to_json('2000-01-01T00:00:00Z'::timestamptz) AS timestamptz_json
    `)
  );
}

test().catch(console.error);
