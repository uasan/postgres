import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  const sql = `
    SELECT skill_id, first_name, skill_id::text || first_name AS "d.dd"
    FROM ludicloud.users AS u
    JOIN smartpeople.users_skills AS us USING(uid)
    WHERE $1 = u.uid
    ORDER BY last_name
  `;

  const params = ['c5207a27-2614-4ed3-97e2-f3fdad40b3de'];

  const task = db.prepare();
  await task.execute(sql, params);
  await db.query(sql, params);

  // console.dir(
  //   await db.query(
  //     `EXPLAIN (FORMAT JSON, COSTS false, VERBOSE true, GENERIC_PLAN true)
  //       ${sql}`,
  //     ['c5207a27-2614-4ed3-97e2-f3fdad40b3de']
  //   ),
  //   {
  //     depth: null,
  //     colors: true,
  //   }
  // );
}

test().catch(console.error);
