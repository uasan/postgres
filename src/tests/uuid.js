import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  const result = await db.sql`
    SELECT
      ${'c5207a27-2614-4ed3-97e2-f3fdad40b3de'}::uuid AS uuid,
      ${'c5207a2726144ed3-97e2f3fdad40b3de'}::uuid AS uuid_short
  `.asObject();

  console.log(result, result.uuid === result.uuid_short);
}

try {
  await test();
} catch (error) {
  console.error(error);
}
