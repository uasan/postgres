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

async function test() {
  // const sql = `
  //   SELECT
  //     us.skill_id,
  //     u.first_name
  //   FROM ludicloud.users AS u
  //   JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
  //   JOIN smartlibrary.skills AS sk ON(sk.skill_id = us.skill_id AND sk.catalog_id = any($2))
  //   WHERE u.uid IN($1, $3) AND last_name % 'aaa'
  //   ORDER BY last_name
  // `;

  const sql = `
    SELECT coalesce("skill_name", null) AS dd
    FROM smartlibrary.skills
    LEFT JOIN smartpeople.users_skills AS us ON us.uid = 'c5207a27-2614-4ed3-97e2-f3fdad40b3de'
    LEFT JOIN ludicloud.users_roles USING(uid)
    WHERE us.uid IS NULL
    LIMIT 1
  `;

  // const sql = `
  // SELECT count(*) AS id
  // FROM smartlibrary.skills
  // `;

  await db.prepare().setCache().execute(sql, []);
  //console.log('RESULT', await db.prepare().setCache().execute(sql, []));

  setTimeout(
    async () =>
      await db.prepare().execute(`
    INSERT INTO ludicloud.users_roles (uid, role)
      VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', 'smartpeople_user');

    UPDATE ludicloud.users_roles
    SET role = 'smartpeople_hr'
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_user';

    DELETE FROM ludicloud.users_roles
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_hr';

    --TRUNCATE ludicloud.users_roles;

    SELECT pg_logical_emit_message(true, 'my_prefix', 'Text Payload');
  `),
    100
  );
}

test().catch(console.error);
