import { identity } from '#native';
import { types } from '../protocol/types.js';

const decodeBool = reader => reader.bytes[reader.offset] === 1;

function encodeBool(writer, value) {
  writer.setInt32(1).setUint8(value ? 1 : 0);
}

const serialize = value => Boolean(value).toString();

types.addType({
  id: 16,
  array: 1000,
  name: 'bool',
  quote: identity,
  decode: decodeBool,
  encode: encodeBool,
  serialize,
});
