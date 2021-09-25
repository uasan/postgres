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
    await db2.query('TRUNCATE smartlibrary.locations CASCADE');
    await db2.query(`SET session_replication_role = 'replica'`);

    console.time('COPY');

    const readableStream = await db1.query(
      `COPY smartlibrary.locations_copy TO STDOUT`
    );
    const writableStream = await db2.query(
      `COPY smartlibrary.locations FROM STDIN`
    );

    await readableStream.pipeTo(writableStream);

    console.timeEnd('COPY');
  } catch (error) {
    console.error(error);
  }
}

test();
