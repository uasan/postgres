import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
});

// const db = new PostgresPool({
//   max: 1,
//   host: '127.0.0.1',
//   port: 9090,
//   username: 'api_ludicloud_v2',
//   password: 'pass',
//   database: 'smartapps-v2',
// });

async function test() {
  let sql = `
    SELECT
      $1::ludicloud.api_type[] AS in,
      ARRAY['users_search'::ludicloud.api_type] AS out
    `;

  const params = [['users_search']];

  try {
    const result = await db.query(sql, params);

    console.log(result[0]);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
