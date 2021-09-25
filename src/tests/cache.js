import { Pool } from '../pool.js';
import { getRelationNames } from '../cache/relation.js';
import { FETCH_ONE_VALUE } from '../constants.js';
import { signal } from '#utils/process.js';

const db = new Pool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  signal,
  username: 'postgres',
  password: 'pass',
  database: 'postgres',
});

async function test() {
  let sql = `
  EXPLAIN (FORMAT JSON, VERBOSE true, COSTS false)

  -- SELECT * FROM smartpeople.match_posts_to_users(
  -- '8a74a9e0-f633-4793-ba1e-5c57cf0c31e2'::uuid,
  -- null,
  -- null
  -- )

  SELECT * FROM pg_catalog.pg_class
  
  `;

  const params = [];

  try {
    console.log(getRelationNames(await db.query(sql, params, FETCH_ONE_VALUE)));
  } catch (error) {
    console.error(error);
  }
}

test();
