import { Pool } from '../pool.js';

const db1 = new Pool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

const db2 = new Pool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  try {
    await db2.query(`CREATE TEMP TABLE temp_copy (LIKE pg_catalog.pg_statistic)`);
    await db2.query(`SET session_replication_role = 'replica'`);

    console.time('COPY');

    const readableStream = await db1.query(
      `COPY pg_catalog.pg_statistic TO STDOUT`
    );
    const writableStream = await db2.query(
      `COPY temp_copy FROM STDIN`
    );

    await readableStream.pipeTo(writableStream);

    console.timeEnd('COPY');
  } catch (error) {
    console.error(error);
  }
}

test();
