import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test(payload) {
  const query = db.sql`
    SELECT 1
  `.builder();

  if (payload.value) {
    query.sql`WHERE 1 >= ${payload.value}`;
  }

  query.log();
  console.log('RESULT', await query);
}

await test({
  value: 1,
});
