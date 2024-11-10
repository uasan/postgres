import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  try {
    await db.begin();
    await db.query('TRUNCATE ludicloud.import_data_users');

    const writer = await db.prepare().copyFrom('ludicloud.import_data_users', {
      columns: ['_index', '_task_id', 'location_queries'],
      freeze: true,
    });

    console.time('copyFrom');

    for (let i = 0; i < 10_000; i++) {
      if (i === 5000) {
        // await writer.abort();
        // break;
        // await db.cancelRequest();
        // await {
        //   then(resolve) {
        //     setTimeout(resolve, 1000);
        //   },
        // };
      }

      await writer.write({
        _index: i,
        _task_id: i,
        location_queries: ['AAA'],
      });
    }

    await writer.close();
    console.timeEnd('copyFrom');

    await db.commit();
  } catch (error) {
    console.error(error);
    await db.rollback();
  }

  console.log(await db.query(`SELECT 'END'`, []));
  await db.disconnect();
}

await test();
