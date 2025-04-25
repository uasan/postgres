import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  console.log('Vector', await db.sql`SELECT ${[1, 2, 3]}::vector(3)`.asValue());
}

test().catch(console.error);
