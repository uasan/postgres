import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
  cache: {
    subscribe: {
      username: 'postgres',
      password: 'pass',
    },
  },
});

//https://www.postgresql.org/docs/current/runtime-config-query.html

const id1 = 'c5207a27-2614-4ed3-97e2-f3fdad40b3de';

async function test() {
  const sql1 = `
    SELECT
      us.skill_id,
      u.first_name
    FROM ludicloud.users AS u
    JOIN ludicloud.users_locations AS ul ON (ul.uid = u.uid)
    JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
    JOIN smartlibrary.skills AS sk ON(sk.skill_id = us.skill_id AND sk.catalog_id = any($2))
    WHERE u.uid IN($1, $3) AND last_name % 'aaa'
    ORDER BY last_name
  `;

  const sql2 = `
    SELECT coalesce("skill_name", null) AS dd
    FROM smartlibrary.skills
    LEFT JOIN smartpeople.users_skills AS us ON us.uid = $1
    LEFT JOIN ludicloud.users_roles USING(uid)
    WHERE us.uid IS NULL
    LIMIT 1
  `;

  const sql3 = `
  SELECT count(*) AS id
  FROM smartlibrary.skills
  `;

  for (let i = 0; i < 10; i++) {
    db.prepare().setCache().execute(sql1, [id1, id1, id1]);
    db.prepare().setCache().execute(sql2, [id1]);
    db.prepare().setCache().execute(sql3, []);
  }

  setTimeout(async () => {
    await db.prepare().execute(`
      BEGIN;
    INSERT INTO ludicloud.users_roles (uid, role)
      VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', 'smartpeople_user');

    UPDATE ludicloud.users_roles
    SET role = 'smartpeople_hr'
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_user';

    DELETE FROM ludicloud.users_roles
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_hr';

    DELETE FROM ludicloud.users_locations;

    SELECT pg_logical_emit_message(true, 'my_prefix', 'Text Payload');
    COMMIT;
  `);
  }, 100);
}

test().catch(console.error);
