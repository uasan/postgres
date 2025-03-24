import { PostgresClient } from '../client.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'develop',
  cache: {
    subscribe: {
      username: 'postgres',
      password: 'pass',
    },
  },
});

//https://www.postgresql.org/docs/current/runtime-config-query.html

const id1 = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c';

//const map = new Map();

async function test() {
  // for (let i = 0n; i < 1_000_000n; i++) {
  //   map.set(i, {
  //     key: i,
  //   });
  // }

  const sql1 = `
    SELECT
      us.skill_id,
      u.first_name,
      sk.skill_name
    FROM ludicloud.users AS u
    --JOIN ludicloud.users_locations AS ul ON (ul.uid = u.uid)
    LEFT JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
    --JOIN smartpeople.import_data_skills AS ds ON (us.uid = u.uid)
    LEFT JOIN smartlibrary.skills AS sk USING(skill_id)
    --JOIN smartlibrary.jobs_access AS ja USING(catalog_id)
    WHERE (u.uid = $1 OR u.uid = $2) AND us.skill_id = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c'
    ORDER BY last_name
  `;

  // const sql1 = `
  //   SELECT
  //     us.skill_id,
  //     u.first_name,
  //     sk.skill_name
  //   FROM ludicloud.users AS u
  //   --JOIN ludicloud.users_locations AS ul ON (ul.uid = u.uid)
  //   JOIN smartpeople.users_skills AS us ON (us.uid = u.uid)
  //   --JOIN smartpeople.import_data_skills AS ds ON (us.uid = u.uid)
  //   LEFT JOIN smartlibrary.skills AS sk USING(skill_id)
  //   JOIN smartlibrary.jobs_access AS ja USING(catalog_id)
  //   WHERE (u.uid = $1 OR u.uid = $2) AND us.skill_id = $3
  //   ORDER BY last_name
  // `;

  const sql2 = `
    SELECT *
    FROM smartlibrary.skills
    LEFT JOIN smartpeople.users_skills AS us ON us.uid = ANY($1)
    LEFT JOIN ludicloud.users_network AS un ON un.uid = ANY($1)
    LEFT JOIN ludicloud.users_roles AS ur ON ur.uid = us.uid AND ur.role = $2
  `;

  const sql3 = `
  SELECT count(*) AS id
  FROM smartlibrary.jobs
  `;

  // const sql3 = `
  // SELECT *
  // --FROM smartplan.get_cycle_dataset('c5207a27-2614-4ed3-97e2-f3fdad40b3de'::uuid, 'c5207a27-2614-4ed3-97e2-f3fdad40b3de'::uuid) AS t ON t.row_id IS NOT NULL
  // FROM smartpeople.match_posts_to_users(
  //   $1::uuid,
  //   $2::smartlibrary.skill_type[],
  //   $3::real,
  //   $4::int[],
  //   $5::uuid[],
  //   $6::uuid[],
  //   $7::uuid[]
  // )`;

  for (let i = 0; i < 10; i++) {
    await db.prepare().useCache().execute(sql1, [id1]);
    // await db
    //   .prepare()
    //   .useCache()
    //   .execute(sql2, [[id1], 'smartpeople_hr']);
    // await db.prepare().useCache().execute(sql3, [id1]);

    if (i === 0) {
      await {
        then(resolve) {
          setTimeout(resolve, 100);
        },
      };
    }
  }

  setTimeout(async () => {
    await db.prepare().execute(`
    BEGIN;
    
    INSERT INTO ludicloud.users_roles (uid, role)
    VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', 'smartpeople_user')
    ON CONFLICT DO NOTHING;

    DELETE FROM smartpeople.users_skills WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c';

    INSERT INTO smartpeople.users_skills (uid, skill_id)
    VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', '03e47f63-e588-5859-b709-b692871c28e3');

    DELETE FROM smartlibrary.jobs_access
    WHERE (catalog_id, access_type, uid) = ('8da897fa-ee25-44f6-a434-1fe44dbfe045', 'editor', 'c9a2af07-f4ba-4097-bf56-19abe720aa4c'); 

    INSERT INTO smartlibrary.jobs_access (catalog_id, access_type, uid)
    VALUES ('8da897fa-ee25-44f6-a434-1fe44dbfe045', 'editor', 'c9a2af07-f4ba-4097-bf56-19abe720aa4c');

    UPDATE ludicloud.users_roles
    SET role = 'smartpeople_hr'
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_user';

    DELETE FROM ludicloud.users_roles
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_hr';

    SELECT pg_logical_emit_message(true, 'my_prefix', 'Text Payload');
    COMMIT;
  `);
  }, 100);
}

test().catch(console.error);
