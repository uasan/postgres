const { BigInt } = globalThis;

const decodeTextInt = reader => +reader.getTextUTF8();
const decodeTextNumeric = reader => reader.getTextUTF8();
const decodeBlobInt2 = ({ view, offset }) => view.getInt16(offset);
const decodeBlobInt4 = ({ view, offset }) => view.getInt32(offset);
const decodeBlobUint4 = ({ view, offset }) => view.getUint32(offset);
const decodeBlobFloat4 = ({ view, offset }) => view.getFloat32(offset);
const decodeBlobFloat8 = ({ view, offset }) => view.getFloat64(offset);
const decodeBlobInt8 = ({ view, offset }) =>
  view.getBigInt64(offset).toString();

const encodeBlobInt2 = (writer, value) => {
  writer.setInt32(2).setInt16(value);
};

const encodeBlobInt4 = (writer, value) => {
  writer.setInt32(4).setInt32(value);
};

const encodeBlobUint4 = (writer, value) => {
  writer.setInt32(4).setUint4(value);
};

const encodeBlobFloat4 = (writer, value) => {
  writer.setInt32(4).setFloat32(value);
};

const encodeBlobFloat8 = (writer, value) => {
  writer.setInt32(8).setFloat64(value);
};

const encodeBlobInt8 = (writer, value) => {
  writer.setInt32(8).setBigInt64(BigInt(value));
};

const encodeTextNumeric = (writer, value) => {
  writer.setUTF8(value);
};

export const int2 = {
  id: 21,

  decode: decodeBlobInt2,
  encode: encodeBlobInt2,

  decodeText: decodeTextInt,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobInt2,
  encodeBlob: encodeBlobInt2,
};

export const int4 = {
  id: 23,

  decode: decodeBlobInt4,
  encode: encodeBlobInt4,

  decodeText: decodeTextInt,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobInt4,
  encodeBlob: encodeBlobInt4,
};

export const oid = {
  id: 26,

  decode: decodeBlobUint4,
  encode: encodeBlobUint4,

  decodeText: decodeTextInt,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobUint4,
  encodeBlob: encodeBlobUint4,
};

export const int8 = {
  id: 20,

  decode: decodeBlobInt8,
  encode: encodeBlobInt8,

  decodeText: decodeTextNumeric,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobInt8,
  encodeBlob: encodeBlobInt8,
};

export const float4 = {
  decode: decodeBlobFloat4,
  encode: encodeBlobFloat4,

  decodeText: decodeTextInt,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobFloat4,
  encodeBlob: encodeBlobFloat4,
};

export const float8 = {
  decode: decodeBlobFloat8,
  encode: encodeBlobFloat8,

  decodeText: decodeTextInt,
  encodeText: encodeTextNumeric,

  decodeBlob: decodeBlobFloat8,
  encodeBlob: encodeBlobFloat8,
};

export const money = { ...int8, id: 709 };
export const xid = { ...oid, id: 28 };
export const cid = { ...oid, id: 29 };
export const regproc = { ...oid, id: 24 };

export const numeric = {
  decode: decodeTextNumeric,
  encode: encodeTextNumeric,

  decodeText: decodeTextNumeric,
  encodeText: encodeTextNumeric,

  decodeBlob: null,
  encodeBlob: null,
};
