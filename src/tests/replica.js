import { PostgresClient } from '../client.js';
import { PostgresReplication } from '../replication.js';

const db = new PostgresClient({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

const replica = new PostgresReplication({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'pass',
  database: 'smartapps',
});

function onChange({ schema, name }, action, newValues, oldValues) {
  console.log(action + ': ' + schema + '.' + name, {
    newValues,
    oldValues,
  });
}

const handler = {
  onDelete(table, oldValues) {
    onChange(table, 'DELETE', undefined, oldValues);
  },

  onUpdate(table, newValues, oldValues) {
    onChange(table, 'UPDATE', newValues, oldValues);
  },

  onInsert(table, newValues) {
    onChange(table, 'INSERT', newValues);
  },

  onTruncate(table) {
    onChange(table, 'TRUNCATE');
  },

  onMessage(prefix, payload) {
    console.log('MESSAGE: ', { prefix, payload });
  },
};

async function test() {
  await replica.subscribe(['cache'], handler);

  await db.query(`
    INSERT INTO ludicloud.users_roles (uid, role)
      VALUES ('c9a2af07-f4ba-4097-bf56-19abe720aa4c', 'smartpeople_user');

    UPDATE ludicloud.users_roles
    SET role = 'smartpeople_hr'
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_user';

    DELETE FROM ludicloud.users_roles
    WHERE uid = 'c9a2af07-f4ba-4097-bf56-19abe720aa4c' AND role = 'smartpeople_hr';

    TRUNCATE ludicloud.users_roles;

    SELECT pg_logical_emit_message(true, 'my_prefix', 'Text Payload');
  `);

  // setInterval(async () => {
  //   console.log(
  //     (
  //       await db.query(
  //         'SELECT sent_lsn, write_lsn, write_lag::text FROM pg_stat_replication',
  //         []
  //       )
  //     )[0]
  //   );
  // }, 5000);
}

test().catch(console.error);
