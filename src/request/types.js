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

import { Task } from '../task.js';
import { types } from '../protocol/types.js';
import { selectTypes } from '../utils/queries.js';

export const rawType = types.get(17);

export const getType = (task, id) =>
  types.get(id) ?? task.client.types.get(id) ?? addTypeUnknown(task, id);

function addTypeUnknown(task, id) {
  if (task.unknownTypes === null) {
    task.unknownTypes = [id];
  } else if (task.unknownTypes.includes(id) === false) {
    task.unknownTypes.push(id);
  }

  return task.client.types.create(id);
}

export async function resolveTypes(task) {
  const { unknownTypes } = task;

  task.unknownTypes = null;
  task.client.writer.sync();
  task.client.queue.unshift(task);

  try {
    task.client.task = Object.create(task);

    await {
      then(resolve) {
        task.client.task.onReady = resolve;
      },
    };

    task.client.queue.unshift(task);
    const rows = await new Task(task.client)
      .asValue()
      .forceExecute(selectTypes(unknownTypes));

    for (let i = 0; i < rows.length; i++) {
      task.client.types.setType(rows[i]);
    }

    task.uncork();
  } catch (error) {
    console.error(error);
    task.client.writer.sync();
    task.reject(error);
  }
}
