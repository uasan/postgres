import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const sql = `SELECT $1::text[], 'AAAA' AS a, 'BBBB' AS b`;

  const values = [
    ['A', 'B'],
    [null, null],
    [null, null],
  ];

  const result = await db.prepare().setDataAsValues().execute(sql, [values]);
  console.log('RESULT', result);
}

await test();
