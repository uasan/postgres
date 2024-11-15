import { noop } from '#native';
import { setCountData, setNoData } from './state.js';
import { getType, resolveTypes, rawType } from '../request/types.js';
import { TRANSACTION_ACTIVE, TRANSACTION_INACTIVE } from '../constants.js';

export function parameterDescription({ task, reader }) {
  const length = reader.getInt16();
  const { encoders } = task.statement.setParams(length);

  for (let i = 0; i < length; i++) {
    encoders.push(getType(task, reader.getInt32()));
  }
}

export function rowDescription({ task, reader }) {
  if (task.statement) {
    const length = reader.getInt16();
    const { columns, decoders } = task.statement;

    for (let i = 0; i < length; i++) {
      reader.ending = reader.bytes.indexOf(0, reader.offset);
      columns.push(reader.getTextUTF8());
      reader.offset = reader.ending + 7;

      decoders.push(
        task.isNoDecode ? rawType : getType(task, reader.getInt32())
      );

      reader.offset += 8;
    }

    if (task.unknownTypes) {
      resolveTypes(task);
    } else {
      task.onDescribe();
    }
  } else {
    task.setData = noop;
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
  task.isData = true;
  task.setData(reader);
}

export function commandComplete(client) {
  const { task, reader } = client;
  const { resolve } = task;

  if (task.onComplete !== noop) {
    task.onComplete(reader.getString().split(' '));
  } else if (task.isData) {
    resolve(task.data);
  } else {
    const words = reader.getString().split(' ');

    switch (words[0]) {
      case 'UPDATE':
      case 'DELETE':
      case 'MERGE':
      case 'MOVE':
      case 'COPY':
        setCountData(task, words[1]);
        break;

      case 'INSERT':
        setCountData(task, words[2]);
        break;

      case 'SELECT':
      case 'FETCH':
        setNoData(task);
        break;

      default:
        task.onReady = resolve;
    }
  }
}

export function emptyQueryResponse({ task }) {
  task.reject({ message: 'Empty query string' });
}

export function readyForQuery(client) {
  const state = client.reader.bytes[client.reader.offset];
  const { task } = client;

  if (client.state !== state) {
    client.state = state;
    client.isIsolated ||= state !== TRANSACTION_INACTIVE;
    client.transactions = state === TRANSACTION_ACTIVE ? 1 : 0;
  }

  task?.onReady();

  if (client.task === task) {
    client.task = client.queue.dequeue();
  }

  if (client.task === null) {
    client.isReady = true;

    if (client.waitReady) {
      client.waitReady.resolve();
      client.waitReady = null;
    }
  }
}

export function bindComplete() {}
export function parseComplete() {}
export function closeComplete() {}
export function portalSuspended() {}
