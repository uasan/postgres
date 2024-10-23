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
import '../types/tsquery.js';
import '../types/tsvector.js';
import '../types/record/type.js';

import { Task } from './task.js';
import { types } from '../protocol/types.js';
import { SELECT_TYPES } from '../utils/queries.js';

export const rawType = types.get(17);

export const getType = (task, id) =>
  types.get(id) ?? task.client.types.get(id) ?? addTypeUnknown(task, id);

function addTypeUnknown(task, id) {
  task.unknownTypes ??= new Set();
  task.unknownTypes.add(id);

  return task.client.types.create(id);
}

export function resolveTypes(task) {
  task.cork().isSent = false;

  task.client.writer.sync();
  task.client.queue.unshift(task);

  task.client.task = Object.create(task);
  task.client.task.onReady = onReadyResolveTypes;
}

async function onReadyResolveTypes() {
  const task = Object.getPrototypeOf(this);

  try {
    const rows = await new Task(task.client).forceExecute(SELECT_TYPES, [
      [...task.unknownTypes],
    ]);

    for (let i = 0; i < rows.length; i++) {
      task.client.types.setType(rows[i]);
    }

    task.uncork();
  } catch (error) {
    task.client.queue.dequeue();
    task.client.writer.sync();
    task.reject(error);
  }
}
