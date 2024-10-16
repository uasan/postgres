import { PostgresPool } from '../pool.js';
import { FETCH_ONE_VALUE} from '../constants.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let sql = `SELECT _ FROM (values($1::int, $2::text)) _`;

  const params = [10, 'AAA'];

  try {
    console.log(await db.query(sql, params, FETCH_ONE_VALUE));
  } catch (error) {
    console.error(error);
  }
}

await test();
