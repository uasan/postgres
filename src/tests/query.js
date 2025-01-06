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

    await db.query('CREATE TEMP TABLE test (value text not null primary key)');
    result.insert = await db.query(
      `INSERT INTO test (value) VALUES('AAA')`,
      []
    );

    result.simpleSelect = await db
      .query(
        ` SELECT '1' AS one;
          SELECT '2' AS two;
          SELECT '3' AS three;`
      )
      .catch(console.error);

    result.select = await db
      .query(`SELECT * FROM test`, [])
      .catch(console.error);

    result.update = await db.query(`UPDATE test SET value = 'BBB'`, []);
    result.delete = await db.query('DELETE FROM test WHERE value IS NULL', []);

    console.log(result);

    await db.disconnect();
  } catch (error) {
    console.error(error);
  }
}

test();
