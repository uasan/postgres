import { noop } from '#native';
import { getType, resolveTypes, rawType } from '../request/types.js';
import { TRANSACTION_ACTIVE, TRANSACTION_INACTIVE } from '../constants.js';
import { SimpleQuery } from '../statements/simple.js';

export function emptyQueryResponse({ task }) {
  task.reject({ message: 'Empty query string' });
}

export function parseComplete({ task }) {
  if (task.statement.isReady) {
    task.statement.execute(task);
  } else if (task.statement.task !== task) {
    task.statement.tasksWaitReady ??= new Set();
    task.statement.tasksWaitReady.add(task);
  }
}

export function parameterDescription({ task, reader }) {
  const length = reader.getInt16();
  const { encoders } = task.statement.setParams(length);

  for (let i = 0; i < length; i++) {
    encoders[i] = getType(task, reader.getInt32());
  }
}

export function rowDescription({ task, reader }) {
  if (task.isSimpleQuery) {
    task.statement = new SimpleQuery();
  }

  const length = reader.getInt16();
  const columns = new Array(length);
  const decoders = new Array(length);

  task.statement.columns = columns;
  task.statement.decoders = decoders;

  for (let i = 0; i < length; i++) {
    columns[i] = reader.getString();
    reader.offset += 6;

    decoders[i] = task.isNoDecode ? rawType : getType(task, reader.getInt32());
    reader.offset += 8;
  }

  if (task.unknownTypes) {
    resolveTypes(task);
  } else {
    task.statement.onReady(task);
  }
}

export function noData({ task }) {
  if (task.unknownTypes) {
    resolveTypes(task);
  } else {
    task.statement.onReady(task);
  }
}

export function dataRow({ task, reader }) {
  if (task.isData === false) {
    task.isData = true;
    task.initData();
  }

  reader.offset += 2;
  task.setData(reader);
}

export function commandComplete(client) {
  if (client.task.onComplete !== noop) {
    client.task.onComplete();
  } else if (client.task.statement) {
    client.task.statement.complete(client);
  } else {
    client.task.onReady = client.task.resolve;
  }
}

export function readyForQuery(client) {
  const state = client.reader.bytes[client.reader.offset];

  if (client.state !== state) {
    client.state = state;
    client.isIsolated = state !== TRANSACTION_INACTIVE;
    client.transactions = state === TRANSACTION_ACTIVE ? 1 : 0;
  }

  client.task.isDone = true;
  client.task.onReady();

  if (client.task.isCorked === false) {
    client.sendTask();
  }
}

export function bindComplete() {}
export function portalSuspended() {}
export function closeComplete() {}
