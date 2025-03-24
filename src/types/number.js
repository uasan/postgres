import { BigInt, identity } from '#native';
import { types } from '../protocol/types.js';
import { ensureFinite, slashLSN } from '../utils/number.js';

const decodeInt2 = ({ view, offset }) => view.getInt16(offset);
const decodeInt4 = ({ view, offset }) => view.getInt32(offset);
const decodeUint4 = ({ view, offset }) => view.getUint32(offset);
const decodeFloat4 = ({ view, offset }) => view.getFloat32(offset);
const decodeFloat8 = ({ view, offset }) => view.getFloat64(offset);
const decodeInt8 = ({ view, offset }) => view.getBigInt64(offset);
const decodeUint8 = ({ view, offset }) => view.getBigUint64(offset);

function encodeInt2(writer, value) {
  writer.setInt32(2).setInt16(value);
}

function encodeInt4(writer, value) {
  writer.setInt32(4).setInt32(value);
}

function encodeUint4(writer, value) {
  writer.setInt32(4).setUint32(value);
}

function encodeInt8(writer, value) {
  writer.setInt32(8).setBigInt64(BigInt(value));
}

function encodeUint8(writer, value) {
  writer.setInt32(8).setBigUint64(BigInt(value));
}

function encodeFloat4(writer, value) {
  writer.setInt32(4).setFloat32(value);
}

function encodeFloat8(writer, value) {
  writer.setInt32(8).setFloat64(value);
}

const serializeBigInt = value => BigInt(value).toString();
const serializeNumber = value => ensureFinite(Number(value)).toString();

const deserializeBigInt = BigInt;
const deserializeNumber = Number;

export const serializeLSN = value =>
  slashLSN(BigInt(value).toString(16).toUpperCase());

export const deserializeLSN = value => BigInt('0x' + value.replace('/', ''));

types
  .addType({
    id: 20,
    array: 1016,
    name: 'int8',
    quote: identity,
    decode: decodeInt8,
    encode: encodeInt8,
    serialize: serializeBigInt,
    deserialize: deserializeBigInt,
  })
  .addType({
    id: 21,
    array: 1005,
    name: 'int2',
    quote: identity,
    decode: decodeInt2,
    encode: encodeInt2,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 22,
    array: 1006,
    name: 'int2vector',
    decode: decodeInt2,
    encode: encodeInt2,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 23,
    array: 1007,
    name: 'int4',
    quote: identity,
    decode: decodeInt4,
    encode: encodeInt4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 24,
    array: 1008,
    name: 'regproc',
    quote: identity,
    decode: decodeUint4,
    encode: encodeUint4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 26,
    array: 1028,
    name: 'oid',
    quote: identity,
    decode: decodeUint4,
    encode: encodeUint4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 28,
    array: 1011,
    name: 'xid',
    quote: identity,
    decode: decodeUint4,
    encode: encodeUint4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 5069,
    array: 271,
    name: 'xid8',
    quote: identity,
    decode: decodeUint8,
    encode: encodeUint8,
    serialize: serializeBigInt,
    deserialize: deserializeBigInt,
  })
  .addType({
    id: 29,
    array: 1012,
    name: 'cid',
    quote: identity,
    decode: decodeUint4,
    encode: encodeUint4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 30,
    array: 1013,
    name: 'oidvector',
    decode: decodeUint4,
    encode: decodeUint4,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 700,
    array: 1021,
    name: 'float4',
    quote: identity,
    decode: decodeFloat4,
    encode: encodeFloat4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 701,
    array: 1022,
    name: 'float8',
    quote: identity,
    decode: decodeFloat8,
    encode: encodeFloat8,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 709,
    array: 791,
    name: 'money',
    decode: decodeInt8,
    encode: encodeInt8,
    serialize: serializeBigInt,
    deserialize: deserializeBigInt,
  })
  .addType({
    id: 2205,
    array: 2210,
    name: 'regclass',
    quote: identity,
    decode: decodeUint4,
    encode: encodeUint4,
    serialize: serializeNumber,
    deserialize: deserializeNumber,
  })
  .addType({
    id: 3220,
    array: 3221,
    name: 'pg_lsn',
    quote: identity,
    decode: decodeUint8,
    encode: encodeUint8,
    serialize: serializeLSN,
    deserialize: deserializeLSN,
  });
