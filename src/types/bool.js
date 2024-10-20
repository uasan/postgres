import { types } from '../protocol/types.js';

const decodeBool = reader => reader.uint8[reader.offset] === 1;

function encodeBool(writer, value) {
  writer.setInt32(1).setUint8(value === true ? 1 : 0);
}

types.add({
  id: 16,
  array: 1000,
  name: 'bool',
  decode: decodeBool,
  encode: encodeBool,
});
