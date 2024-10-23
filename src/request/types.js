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
import { SQL_FETCH_TYPES } from '../utils/queries.js';

export const rawType = types.get(17);

export const getType = (task, id) =>
  types.get(id) ?? task.client.types.get(id) ?? addTypeAsUnknown(task, id);

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
      client.types.setType(rows[i]);
    }

    //console.log(client.writer.isLocked, client.types);
  } catch (error) {
    console.error(error);
  }

  Object.getPrototypeOf(this).uncork();
}
