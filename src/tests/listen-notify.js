import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let i = 0;

  await db.listen('test', console.log);
  await db.listen('test', console.log);
  await db.listen('test', console.log);

  await db.listen('test2', console.log);
  await db.listen('test2', console.log);
  await db.listen('test2', console.log);

  await db.listen('test3', console.log);
  await db.listen('test3', console.log);
  await db.listen('test3', console.log);

  setInterval(async () => {
    try {
      await db.notify('test', ++i);
      await db.notify('test2', ++i);
      await db.notify('test3', ++i);
    } catch (error) {
      console.error(error);
    }
  }, 100);
}

test().catch(console.error);
