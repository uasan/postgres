import '../types/text.js';
import '../types/number.js';
import '../types/uuid.js';
import '../types/bool.js';
import '../types/bytea.js';
import '../types/bit.js';
import '../types/date.js';
import '../types/numeric.js';
import '../types/range.js';
import '../types/geo.js';
import '../types/net.js';
import '../types/json.js';
import '../types/record/type.js';

import { Task } from './task.js';
import { types } from '../protocol/types.js';

export const rawType = types.get(17);

const SQL_FETCH_TYPES = `SELECT
  a.oid,
  a.typarray AS array,
  n.nspname || '.' || a.typname AS name
FROM (
  SELECT DISTINCT CASE WHEN typelem != 0 THEN typelem ELSE oid END AS oid
  FROM pg_catalog.pg_type
  WHERE oid = ANY($1)
) AS _
JOIN pg_catalog.pg_type AS a USING(oid)
JOIN pg_catalog.pg_namespace AS n ON n.oid = a.typnamespace`;

export const getType = (task, id) =>
  types.get(id) ?? task.client.types.get(id) ?? addTypeAsUnknown(task, id);

function setType(client, data) {
  const type = client.types.factory(data.oid);

  if (type.name) {
    return;
  }

  type.name = data.name;

  if (data.array) {
    client.types.setArrayType(type, data.array);
  }
}

function addTypeAsUnknown(task, id) {
  task.unknownTypes ??= new Set();
  task.unknownTypes.add(id);
  return task.client.types.create(id);
}

export function resolveTypes(task) {
  const { client } = task;

  task.cork().isSent = false;

  client.writer.sync();
  client.queue.unshift(task);

  client.task = Object.create(task);
  client.task.onReady = onReadyResolveTypes;
}

async function onReadyResolveTypes() {
  const { client } = this;

  try {
    const rows = await new Task(client).forceExecute(SQL_FETCH_TYPES, [
      [...this.unknownTypes],
    ]);

    for (let i = 0; i < rows.length; i++) {
      setType(client, rows[i]);
    }

    //console.log(client.writer.isLocked, client.types);
  } catch (error) {
    console.error(error);
  }

  Object.getPrototypeOf(this).uncork();
}
