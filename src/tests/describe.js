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

  //const params = [['users_search']];

  try {
    let result = await db.prepare().describe(sql);

    console.log(result.encoders);
    console.log(await db.query('SELECT 1', []));

    result = await db.prepare().describe(sql);
    console.log(result.encoders);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
