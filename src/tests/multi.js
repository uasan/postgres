import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  db.query(`SELECT $1::int`, [1], 8).then(
    num => console.log(1, num),
    console.error
  );
  db.query(`SELECT $1::int`, [2], 8).then(
    num => console.log(2, num),
    console.error
  );
  db.query(`SELECT $1::int, 3`, [3], 8).then(
    num => console.log(3, num),
    console.error
  );
  db.query(`SELECT $1::int, 4`, [4], 8).then(
    num => console.log(4, num),
    console.error
  );
  db.query(`SELECT $1::int`, [5], 8).then(
    num => console.log(5, num),
    console.error
  );

  for (let i = 0; i < 10; i++)
    await db.query(`SELECT $1::int`, [i], 8).then(num => console.log(i, num));
}

test().catch(console.error);
