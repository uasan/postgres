import { ContextExplain } from '../cache/explain/context.js';
import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

//https://www.postgresql.org/docs/current/runtime-config-query.html

async function test() {
  const sql = `
    SELECT
      us.skill_id,
      u.first_name
    FROM ludicloud.users AS u
    JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
    JOIN smartlibrary.skills AS sk ON(sk.skill_id = us.skill_id AND sk.catalog_id = any($2))
    WHERE u.uid IN($1, $3) AND last_name % 'aaa'
    ORDER BY last_name
  `;

  // const sql = `
  // SELECT *
  // FROM (
  //     SELECT coalesce("skill_name", null) AS dd
  //     FROM smartlibrary.skills
  //   ) _
  // `;

  // const sql = `
  // SELECT count(*) AS id
  // FROM smartlibrary.skills
  // `;

  const task = db.prepare();
  await task.execute(sql, []);

  const context = await ContextExplain.create(task);

  console.dir(context, {
    depth: null,
    colors: true,
  });
}

test().catch(console.error);
