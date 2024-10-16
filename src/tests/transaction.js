import { noop } from '#native';
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

    await db.reset({ ...options, database: 'A' }).catch(noop);
    await db.reset(options);
    await db.reset({ ...options, database: 'B' }).catch(noop);
    await db.reset(options);
    await db.reset({ ...options, database: 'C' }).catch(noop);
    await db.reset(options);

    await db.begin();

    //await db.query('SELECT 1::int / 0::int').catch(console.error);

    await db.query('SAVEPOINT _1');
    //await db.query('ROLLBACK TO SAVEPOINT _1');
    await db.query('RELEASE SAVEPOINT _1');

    await db.commit();

    db = db.unIsolate();
  } catch (error) {
    console.error(error);
  }

  await pool.disconnect();
}

test();
