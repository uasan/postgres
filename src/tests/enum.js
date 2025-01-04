import { PostgresClient } from '../client.js';

const db = new PostgresClient({
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
    const p2 = db.query('SELECT 1', []);
    const p1 = db.query(sql, params);

    const result = await p1;

    console.log(result[0]);

    console.log(await p2);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
