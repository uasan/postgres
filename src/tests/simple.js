import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  console.log(
    'RESULT',
    await db.query(`
    ALTER TABLE ludicloud.users ADD COLUMN IF NOT EXISTS username text;
    ALTER TABLE ludicloud.users ADD COLUMN IF NOT EXISTS uid uuid;
    UPDATE ludicloud.users SET username = '' WHERE false;
  `)
  );
}

test().catch(console.error);
