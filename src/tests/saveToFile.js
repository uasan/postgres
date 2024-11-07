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

    await db
      .prepare()
      .setSaveToFile('./test.txt')
      .execute(
        ` SELECT value::text || '\n'
          FROM generate_series(1, 1_000) AS _(value)`,
        []
      );

    console.timeEnd('saveToFile');
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
