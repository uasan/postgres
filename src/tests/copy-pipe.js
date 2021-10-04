import { Pool } from '../pool.js';

const db1 = new Pool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

const db2 = new Pool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  try {
    await db2.query(
      `CREATE TEMP TABLE temp_copy (LIKE smartlibrary.locations)`
    );
    await db2.query(`SET session_replication_role = 'replica'`);

    console.time('COPY');

    const readableStream = await db1.query(
      `COPY smartlibrary.locations TO STDOUT (FORMAT 'binary')`
    );
    const writableStream = await db2.query(
      `COPY temp_copy FROM STDIN (FORMAT 'binary')`
    );

    await readableStream.pipeTo(writableStream);

    console.timeEnd('COPY');
  } catch (error) {
    console.error(error);
  }
}

test();
