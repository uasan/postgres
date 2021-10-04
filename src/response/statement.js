import { types, blob, unknown } from '../protocol/types.js';
import { TYPE_BLOB } from '../constants.js';

const decodeAsBlob = blob.decodeBlob;

export const parameterDescription = ({ task, reader }) => {
  reader.offset += 2;
  const { name, params, encoders } = task.statement;

  for (let i = 0; i < encoders.length; i++) {
    //console.log(reader.view.getInt32(reader.offset));
    const { encode, encodeBlob } = types[reader.getInt32()] ?? unknown;

    encoders[i] = encode;
    if (encode === encodeBlob) params[name.length + 5 + i * 2] = 1;
  }
};

export const noData = ({ task }) => {
  task.statement.execute(task.values);
};

export const rowDescription = ({ task, reader }) => {
  const length = reader.getInt16();
  const { columns, decoders } = task.statement;
  const isBlob = task.options & TYPE_BLOB;

  const formats = new Uint8Array(2 + length * 2);
  new DataView(formats.buffer).setInt16(0, length);
  task.statement.formats = formats;

  for (let i = 0; i < length; ++i) {
    reader.ending = reader.uint8.indexOf(0, reader.offset);
    columns.push(reader.getTextUTF8());
    reader.offset = reader.ending;

    reader.offset += 7;

    //console.log(reader.view.getInt32(reader.offset));

    const { decode, decodeBlob } = types[reader.getInt32()] ?? unknown;
    reader.offset += 8;
    decoders.push(isBlob ? decodeAsBlob : decode);
    if (decode === decodeBlob) formats[3 + i * 2] = 1;
  }

  task.statement.execute(task.values);
};

export const dataRow = ({ task, reader }) => {
  task.setData(reader);
};

export const commandComplete = ({ task, reader }) => {
  const { resolve, statement } = task;

  if (statement.columns.length === 0) {
    reader.offset = reader.uint8.indexOf(32, reader.offset) + 1;
    reader.ending = reader.uint8.indexOf(0, reader.offset) - 1;
    resolve({ count: +reader.getTextUTF8() });
  } else resolve(task.data);
};

export const emptyQueryResponse = ({ task }) => {
  task.resolve(null);
};

export const readyForQuery = client => {
  client.onReadyForQuery();
};

export const bindComplete = () => {};
export const parseComplete = () => {};
