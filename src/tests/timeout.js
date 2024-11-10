import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
  timeout: 3000,
});

async function test() {
  //let index = 0;

  db.listen(`name`, console.log);

  // setInterval(() => {
  //   if (++index < 100) db.query(`SELECT 1`);
  // }, 1000);
}

await test();
