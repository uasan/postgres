import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
});

// const db = new PostgresPool({
//   max: 1,
//   host: '127.0.0.1',
//   port: 9090,
//   username: 'api_ludicloud_v2',
//   password: 'pass',
//   database: 'smartapps-v2',
// });

async function test() {
  let sql = `
    SELECT
      $1::earth AS earth
    `;

  const params = [
    ['(1329449.3637380702, -4649971.936350581, 4158287.1974687446)'],
  ];

  try {
    const result = await db.query(sql, params);

    console.log(result[0]);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
