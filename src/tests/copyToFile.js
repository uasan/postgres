import { Stream } from 'node:stream';
import { openSync, writeSync, closeSync, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

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
    console.time('COPY');

    const readableStream = await db.query(
      `COPY (
        SELECT value::text
        FROM generate_series(1, 10) AS _(value)
      ) TO STDOUT (FORMAT 'csv')`,
      []
    );

    // const stream = Stream.Readable.fromWeb(readableStream, {
    //   encoding: 'binary',
    // });

    // const fileStream = createWriteStream('./test.txt', { encoding: 'binary' });

    // await pipeline(stream, fileStream);

    const fd = openSync('./test.txt', 'w');

    for await (const chunk of readableStream) {
      writeSync(fd, chunk);
      console.log(chunk);
    }

    closeSync(fd);

    console.timeEnd('COPY');

    await db.disconnect();
  } catch (error) {
    console.error(error);
  }
}

test();
