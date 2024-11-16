import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  await db.query(`SELECT) 1 / $1::int`, [0]).catch(console.error);

  //console.log('SELECT', await db.query(`SELECT $1::int`, [1]));
}

test().catch(console.error);
