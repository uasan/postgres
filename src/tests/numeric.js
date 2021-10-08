import { Client } from '../client.js';
import { FETCH_ONE_VALUE } from '../constants.js';

const db = new Client({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  console.log(await db.query(`SELECT '1220000'::numeric`, [], FETCH_ONE_VALUE));
}

test().catch(console.error);
