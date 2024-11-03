import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  try {
    const readableStream = await db.query(
      `COPY (SELECT * FROM (VALUES(0, 0), (1, 1)) _) TO STDOUT (FORMAT 'binary')`,
      []
    );

    for await (const chunk of readableStream) {
      console.log(chunk);
    }
  } catch (error) {
    console.error(error);
  }
  await db.disconnect();
}

test();
