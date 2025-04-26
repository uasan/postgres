import { PostgresClient } from '../client.js';
import { SparseVector } from '../types/vector.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  console.log(
    await db.sql`
      SELECT
        ${[1, 2, 3]}::vector(3) AS vector,
        ${new SparseVector(5).set(0, 1.25)}::sparsevec AS sparsevec
  `.asObject()
  );
}

test().catch(console.error);
