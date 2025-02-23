import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
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
      u.first_name,
      sk.skill_name
    FROM ludicloud.users AS u
    JOIN ludicloud.users_locations AS ul ON (ul.uid = u.uid)
    JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
    JOIN smartpeople.import_data_skills AS ds ON (us.uid = u.uid)
    LEFT JOIN smartlibrary.skills AS sk USING(skill_id)
    JOIN smartlibrary.jobs_access AS ja USING(catalog_id)
    WHERE (u.uid = $1 OR u.uid = $2) AND us.skill_id = $3
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
  FROM smartlibrary.jobs
  JOIN smartplan.get_cycle_dataset('c5207a27-2614-4ed3-97e2-f3fdad40b3de'::uuid, 'c5207a27-2614-4ed3-97e2-f3fdad40b3de'::uuid) AS t ON t.row_id IS NOT NULL
  JOIN unnest($1::uuid[]) AS t2(job_id) USING(job_id)
  `;

  for (let i = 0; i < 10; i++) {
    await db.prepare().useCache().execute(sql1, [id1, id1, id1]);
    await db.prepare().useCache().execute(sql2, [id1]);
    await db.prepare().useCache().execute(sql3, [id1]);

    {
      // await {
      //   then(resolve) {
      //     setTimeout(resolve, 100);
      //   },
      // };
    }
  }

  setTimeout(async () => {
    await db.prepare().execute(`
    BEGIN;
    
    INSERT INTO ludicloud.users_roles (uid, role)
    VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', 'smartpeople_user');

    DELETE FROM smartlibrary.jobs_access
    WHERE (catalog_id, access_type, uid) = ('8da897fa-ee25-44f6-a434-1fe44dbfe045', 'editor', 'c9a2af07-f4ba-4097-bf56-19abe720aa4c'); 

    INSERT INTO smartlibrary.jobs_access (catalog_id, access_type, uid)
    VALUES ('8da897fa-ee25-44f6-a434-1fe44dbfe045', 'editor', 'c9a2af07-f4ba-4097-bf56-19abe720aa4c');

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
