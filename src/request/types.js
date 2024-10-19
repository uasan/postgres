import { Task } from './task.js';
import { types, unknown } from '../protocol/types.js';
import { typeArrayOf } from '../types/array/type.js';

const SQL_FETCH_TYPES = `SELECT
  a.oid,
  b.oid AS array,
  n.nspname || '.' || a.typname AS name
FROM (
  SELECT DISTINCT CASE WHEN typelem != 0 THEN typelem ELSE oid END AS oid
  FROM pg_catalog.pg_type
  WHERE oid = ANY($1)
) AS _
JOIN pg_catalog.pg_type AS a USING(oid)
JOIN pg_catalog.pg_namespace AS n ON n.oid = a.typnamespace
LEFT JOIN pg_catalog.pg_type AS b ON b.oid = a.typarray`;

const factoryType = (client, id) =>
  client.types.get(id) ?? createType(client, id);

export const getType = (task, id) =>
  types[id] ?? task.client.types.get(id) ?? addTypeAsUnknown(task, id);

let index = 0;

function createType(client, id) {
  const type = {
    ...unknown,
    id,
    type: null,
    array: null,
    name: '',
    index: ++index,
  };

  client.types.set(id, type);
  return type;
}

function setType(client, data) {
  const type = factoryType(client, data.oid);

  if (type.name) {
    return;
  }

  type.name = data.name;

  if (data.array) {
    type.array = Object.assign(
      factoryType(client, data.array),
      typeArrayOf(type)
    );
  }

  //console.log(type);
}

function addTypeAsUnknown(task, id) {
  task.unknownTypes ??= new Set();
  task.unknownTypes.add(id);
  return createType(task.client, id);
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
    Object.getPrototypeOf(this).uncork();
    client.writer.unlock();
  } catch (error) {
    console.error(error);
  }
}
