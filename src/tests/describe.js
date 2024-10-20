import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  let sql = `
    SELECT
      $1::ludicloud.api_type[] AS in,
      ARRAY['users_search'::ludicloud.api_type] AS out
    `;

  const params = [['users_search']];

  try {
    const result = await db.prepare().describe(sql, params);

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
