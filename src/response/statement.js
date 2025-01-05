import { noop } from '#native';
import { getType, resolveTypes, rawType } from '../request/types.js';
import { TRANSACTION_ACTIVE, TRANSACTION_INACTIVE } from '../constants.js';
import { SimpleQuery } from '../statements/simple.js';

export function parameterDescription({ task, reader }) {
  const length = reader.getInt16();
  const { encoders } = task.statement.setParams(length);

  for (let i = 0; i < length; i++) {
    encoders.push(getType(task, reader.getInt32()));
  }
}

export function rowDescription({ task, reader }) {
  if (task.isSimpleQuery) {
    task.statement = new SimpleQuery();
  }

  const length = reader.getInt16();
  const { columns, decoders } = task.statement;

  for (let i = 0; i < length; i++) {
    reader.ending = reader.bytes.indexOf(0, reader.offset);

    columns.push(reader.getTextUTF8());
    reader.offset = reader.ending + 7;

    decoders.push(task.isNoDecode ? rawType : getType(task, reader.getInt32()));
    reader.offset += 8;
  }

  if (task.unknownTypes) {
    resolveTypes(task);
  } else {
    task.onDescribe();
  }
}

export function noData({ task }) {
  if (task.unknownTypes) {
    resolveTypes(task);
  } else {
    task.onDescribe();
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

export function emptyQueryResponse({ task }) {
  task.reject({ message: 'Empty query string' });
}

export function portalSuspended({ task }) {
  task.resolve(true);
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
    client.isIsolated ||= state !== TRANSACTION_INACTIVE;
    client.transactions = state === TRANSACTION_ACTIVE ? 1 : 0;
  }

  client.task.onReady();
  client.task = client.queue.dequeue();

  if (client.task === null) {
    client.isReady = true;

    if (client.waitReady) {
      client.waitReady.resolve();
      client.waitReady = null;
    }
  }
}

export function parseComplete({ task }) {
  if (task.statement.isReady) {
    task.onDescribe();
  }
}

export function bindComplete() {}
export function closeComplete() {}
