import { PostgresPool } from '../pool.js';

const options = {
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  maxConnections: 10,
};

const pool = new PostgresPool(options);

async function test() {
  let db = pool.isolate();

  try {
    await db.begin();

    await {
      then(resolve) {
        setTimeout(resolve, 10000);
      },
    };

    console.log(await db.query(`SELECT 'QUERY' AS test`, []));

    await db.commit();

    db = db.unIsolate();
  } catch (error) {
    console.error(error);
  } finally {
    console.log(await db.query(`SELECT 'FINALLY' AS test`, []));
  }

  await pool.disconnect();
}

test();
