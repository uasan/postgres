import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
  maxConnections: 10,
});

async function test() {
  for (let i = 0; i < 10; i++) {
    //await db.prepare().execute(`SELECT $1`, [1]);
  }

  for (let i = 0; i < 20; i++) {
    db.prepare()
      .execute(`SELECT $1::ludicloud.api_type`, ['users_search'])
      .then(console.count);
    db.prepare()
      .execute(`SELECT $1, $2, $3, $4`, [1, 2, 3, 4])
      .then(console.count);
    db.prepare().execute(`SELECT $1, $2`, [1, 2]).then(console.count);
    db.prepare().execute(`SELECT $1`, [1]).then(console.count);
    db.prepare().execute(`SELECT $1, $2`, [1, 2]).then(console.count);
    db.prepare().execute(`SELECT $1, $2, $3`, [1, 2, 3]).then(console.count);
    db.prepare().execute(`SELECT 0`, []).then(console.count);
  }
}

test().catch(console.error);
