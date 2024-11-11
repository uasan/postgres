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
  try {
    let db = pool.isolate();

    await db.begin();

    await {
      then(resolve) {
        setTimeout(resolve, 10000);
      },
    };

    console.log('QUERY', await db.query('SELECT 1', []));

    await db.commit();

    db = db.unIsolate();
  } catch (error) {
    console.error(error);
  }

  await pool.disconnect();
}

test();
