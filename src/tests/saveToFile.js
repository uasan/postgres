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

    const state = await db
      .prepare()
      .setDataToFile('./test.txt')
      .execute(
        ` SELECT value::text || '\n'
          FROM generate_series(0, 0) AS _(value)
          WHERE false`,
        []
      );

    console.timeEnd('saveToFile');
    console.log(state);

    await db.disconnect();
  } catch (error) {
    console.error(error);
  }
}

test();
