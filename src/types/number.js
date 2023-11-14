import { BigInt } from '#native';

const decodeInt2 = ({ view, offset }) => view.getInt16(offset);
const decodeInt4 = ({ view, offset }) => view.getInt32(offset);
const decodeUint4 = ({ view, offset }) => view.getUint32(offset);
const decodeFloat4 = ({ view, offset }) => view.getFloat32(offset);
const decodeFloat8 = ({ view, offset }) => view.getFloat64(offset);
const decodeInt8 = ({ view, offset }) => view.getBigInt64(offset);

const encodeInt2 = (writer, value) => {
  writer.setInt32(2).setInt16(value);
};

const encodeInt4 = (writer, value) => {
  writer.setInt32(4).setInt32(value);
};

const encodeUint4 = (writer, value) => {
  writer.setInt32(4).setUint4(value);
};

const encodeInt8 = (writer, value) => {
  writer.setInt32(8).setBigInt64(BigInt(value));
};

const encodeFloat4 = (writer, value) => {
  writer.setInt32(4).setFloat32(value);
};

const encodeFloat8 = (writer, value) => {
  writer.setInt32(8).setFloat64(value);
};

export const int2 = {
  id: 21,
  decode: decodeInt2,
  encode: encodeInt2,
};

export const int4 = {
  id: 23,
  decode: decodeInt4,
  encode: encodeInt4,
};

export const oid = {
  id: 26,
  decode: decodeUint4,
  encode: encodeUint4,
};

export const int8 = {
  id: 20,
  decode: decodeInt8,
  encode: encodeInt8,
};

export const float4 = {
  id: 700,
  decode: decodeFloat4,
  encode: encodeFloat4,
};

export const float8 = {
  id: 701,
  decode: decodeFloat8,
  encode: encodeFloat8,
};

export const money = {
  id: 709,
  decode: decodeInt8,
  encode: encodeInt8,
};

export const xid = {
  id: 28,
  decode: decodeUint4,
  encode: encodeUint4,
};

export const cid = {
  id: 29,
  decode: decodeUint4,
  encode: encodeUint4,
};

export const regproc = {
  id: 24,
  decode: decodeUint4,
  encode: encodeUint4,
};
