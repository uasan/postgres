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
  let db = await pool.begin();

  try {
    console.log(await db.query(`SELECT 'QUERY' AS test`, []));

    console.log((await db.commit()) === pool);
  } catch (error) {
    console.error(error);
  } finally {
    console.log(await db.query(`SELECT 'FINALLY' AS test`, []));
  }
}

test();
