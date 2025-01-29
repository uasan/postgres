import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const values = [
    ['A', 'B'],
    [null, null],
    [null, null],
  ];

  const result = await db.sql`SELECT ${values}::text[]`;

  console.log('RESULT', result);
}

await test();
