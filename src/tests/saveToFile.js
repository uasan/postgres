import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  try {
    console.time('saveToFile');

    const result = await db
      .prepare()
      .setDataToFile('./test.txt')
      .execute(
        ` SELECT value::text || '\n'
          FROM generate_series(1, 10_000_000) AS _(value)
          WHERE (value / CASE WHEN value = 50_000_000 THEN 0 ELSE value END) > 0`,
        []
      );

    console.timeEnd('saveToFile');
    console.log(result);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
