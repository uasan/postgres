import { types, blob, unknown } from '../protocol/types.js';
import { TRANSACTION_INACTIVE, TYPE_BLOB } from '../constants.js';

const decodeAsBlob = blob.decode;

export function parameterDescription({ task, reader }) {
  reader.offset += 2;
  const { encoders } = task.statement;

  for (let i = 0; i < encoders.length; i++) {
    //console.log(reader.view.getInt32(reader.offset));
    const { encode } = types[reader.getInt32()] ?? unknown;
    encoders[i] = encode;
  }
}

export function noData({ task }) {
  task.onDescribe();
}

export function rowDescription({ task, reader }) {
  const length = reader.getInt16();
  const { columns, decoders } = task.statement;
  const isBlob = task.options & TYPE_BLOB;

  for (let i = 0; i < length; i++) {
    reader.ending = reader.uint8.indexOf(0, reader.offset);
    columns.push(reader.getTextUTF8());
    reader.offset = reader.ending;

    reader.offset += 7;

    //console.log(reader.view.getInt32(reader.offset));

    const { decode } = types[reader.getInt32()] ?? unknown;
    reader.offset += 8;
    decoders.push(isBlob ? decodeAsBlob : decode);
  }

  task.onDescribe();
}

export function dataRow({ task, reader }) {
  task.setData(reader);
}

export function commandComplete({ task, reader }) {
  const { resolve, statement } = task;

  if (statement.columns.length === 0) {
    reader.offset = reader.uint8.indexOf(32, reader.offset) + 1;
    reader.ending = reader.uint8.indexOf(0, reader.offset) - 1;
    resolve(+reader.getTextUTF8());
  } else {
    resolve(task.data);
  }
}

export function emptyQueryResponse({ task }) {
  task.resolve(null);
}

export function readyForQuery(client) {
  const state = client.reader.uint8[client.reader.offset];

  if (state !== client.state) {
    client.state = state;
    client.isIsolated ||= state !== TRANSACTION_INACTIVE;
  }

  client.task.onReady();
  client.task = client.queue.dequeue();
}

export const bindComplete = () => {};
export const parseComplete = () => {};
export const closeComplete = () => {};
export const portalSuspended = () => {};
