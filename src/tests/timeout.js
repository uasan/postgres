import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 10,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  parameters: {
    idle_session_timeout: '3s',
  },
});

async function test() {
  //let index = 0;

  await db.query(`SELECT 1`);
  await db.listen(`name`, console.log);
  await db.unlisten(`name`);

  // setInterval(() => {
  //   db.query(`SELECT 1`, []);
  // }, 500);
}

await test().catch(console.error);
