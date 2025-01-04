import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  await db.prepare().execute(`CREATE TEMP TABLE test (id int)`);

  await db.prepare().execute(`SELECT id FROM test WHERE id = $1`, [1]);

  //await db.prepare().execute(`ALTER TABLE test ALTER COLUMN id TYPE text`);
  await db.prepare().execute(`DROP TABLE test`);

  await db.prepare().execute(`SELECT id FROM test WHERE id = $1`, [1]);
}

test().catch(console.error);
