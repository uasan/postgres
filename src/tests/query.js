import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  try {
    const result = {};

    await db.query('CREATE TEMP TABLE test (value text)');
    result.insert = await db.query(`INSERT INTO test (value) VALUES('AAA')`);

    result.select = await db
      .query(
        ` SELECT * FROM test WHERE false;
          SELECT * FROM test WHERE false;
          SELECT * FROM test WHERE false;`
      )
      .catch(console.error);

    result.select = await db
      .query(`SELECT * FROM test WHERE false`, [])
      .catch(console.error);

    result.update = await db.query('UPDATE test SET value = null');
    result.delete = await db.query('DELETE FROM test WHERE value IS NULL');

    console.log(result);

    await db.disconnect();
  } catch (error) {
    console.error(error);
  }
}

test();
