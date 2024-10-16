import { types, blob, unknown } from '../protocol/types.js';
import { TRANSACTION_ACTIVE, TRANSACTION_INACTIVE } from '../constants.js';
import { noop } from '#native';
import { setCountData, setNoData } from './state.js';

const decodeAsBlob = blob.decode;

export function parameterDescription({ task, reader }) {
  const { encoders } = task.statement;

  reader.offset += 2;
  for (let i = 0; i < encoders.length; i++) {
    const { encode } = types[reader.getInt32()] ?? unknown;

    encoders[i] = encode;
  }
}

export function noData({ task }) {
  task.onDescribe();
}

export function rowDescription({ task, reader }) {
  if (task.statement) {
    const length = reader.getInt16();
    const { columns, decoders } = task.statement;

    for (let i = 0; i < length; i++) {
      reader.ending = reader.uint8.indexOf(0, reader.offset);
      columns.push(reader.getTextUTF8());
      reader.offset = reader.ending + 7;

      //console.log(reader.view.getInt32(reader.offset));

      const { decode } = types[reader.getInt32()] ?? unknown;
      reader.offset += 8;
      decoders.push(task.isNoDecode ? decodeAsBlob : decode);
    }

    task.onDescribe();
  } else {
    task.setData = noop;
    //task.reject({ message: 'Not return data in simple query' });
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

    //console.log(words);

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
  const state = client.reader.uint8[client.reader.offset];

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

export const bindComplete = () => {};
export const parseComplete = () => {};
export const closeComplete = () => {};
export const portalSuspended = () => {};
