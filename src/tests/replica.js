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

function setOldValues(fields, column) {
  fields[column.name] = column.oldValue;
  return fields;
}

function setNewValues(fields, column) {
  fields[column.name] = column.newValue;
  return fields;
}

const handler = {
  onBegin(state) {
    console.log('BEGIN:', state);
  },

  onInsert(state, table) {
    console.log('INSERT:', table.getName(), {
      ...state,
      new: table.cols.reduce(setNewValues, {}),
    });
  },

  onUpdate(state, table) {
    console.log('UPDATE:', table.getName(), {
      ...state,
      old: table.cols.reduce(setOldValues, {}),
      new: table.cols.reduce(setNewValues, {}),
    });
  },

  onDelete(state, table) {
    console.log('DELETE:', table.getName(), {
      ...state,
      old: table.cols.reduce(setOldValues, {}),
    });
  },

  onTruncate(state, table) {
    console.log('TRUNCATE:', table.getName(), state);
  },

  onMessage(state, message) {
    console.log('MESSAGE:', {
      ...state,
      message: {
        type: message.type,
        payload: message.text(),
      },
    });
  },

  onCommit(state) {
    console.log('COMMIT:', state, '\n');
  },
};

async function test() {
  await replica.subscribe(['_cache'], handler);

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

  setTimeout(async () => {
    console.log(
      await replica.query(`SELECT to_json(_.*) FROM pg_replication_slots AS _`)
    );
  }, 1000);
}

await test().catch(console.error);
