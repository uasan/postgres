import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 10,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  parameters: {
    idle_session_timeout: '300s',
  },
});

async function test() {
  await db.query(`SELECT 1`);
  await db.listen(`name`, console.log);
  await db.unlisten(`name`);

  const tnx = await db.begin();

  await tnx.query(`SET LOCAL transaction_timeout = '3s'`);
  await tnx.query`SELECT pg_sleep(5)`;
}

await test().catch(console.error);
