import { PostgresPool } from '../pool.js';

const db = new PostgresPool({
  max: 1,
  host: '127.0.0.1',
  port: 5432,
  username: 'api_ludicloud',
  password: 'pass',
  database: 'smartapps',
});

async function test() {
  let sql = `
    SELECT
      $1::inet AS "192.168.1.1/22",
      $2::inet AS "2001:db8:85a3::8a2e:370:7334/128",
      ($2::inet)::text AS text_ipv6
    `;

  const params = ['192.168.1.1/22', '2001:db8:85a3::8a2e:370:7334/128'];

  try {
    const result = await db.query(sql, params);

    console.log(result[0]);
  } catch (error) {
    console.error(error);
  }

  await db.disconnect();
}

await test();
