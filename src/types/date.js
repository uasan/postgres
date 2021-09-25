import { decodeTextASCII, encodeTextASCII } from './text.js';

const decodeBlobTimestamp = ({ view, offset }) =>
  new Date(Number(view.getBigUint64(offset)) / 1000 + 946684800000);

const encodeBlobTimestamp = (writer, value) => {
  const { view, length } = writer;

  writer.alloc(12);
  view.setInt32(length, 8);
  view.setBigUint64(
    length + 4,
    BigInt(value.getTime()) * BigInt(1000) - BigInt('946684800000000')
  );
};

export const date = {
  id: 1082,
  decode: decodeTextASCII,
  encode: encodeTextASCII,

  decodeBlob: null,
  encodeBlob: null,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,
};

export const time = {
  id: 1083,
  decode: decodeTextASCII,
  encode: encodeTextASCII,

  decodeBlob: null,
  encodeBlob: null,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,
};

export const interval = {
  id: 1186,
  decode: decodeTextASCII,
  encode: encodeTextASCII,

  decodeBlob: null,
  encodeBlob: null,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,
};

export const timestamp = {
  id: 1114,
  decode: decodeBlobTimestamp,
  encode: encodeBlobTimestamp,

  decodeBlob: decodeBlobTimestamp,
  encodeBlob: encodeBlobTimestamp,

  decodeText: null,
  encodeText: encodeTextASCII,
};

export const timestamptz = {
  ...timestamp,
  id: 1184,
};
