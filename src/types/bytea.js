import { types } from '../protocol/types.js';

const decodeBytea = reader => reader.uint8.slice(reader.offset, reader.ending);

function encodeBytea(writer, uint8) {
  writer.setInt32(uint8.byteLength).setBytes(uint8);
}

function serializeBytea(data) {
  return Buffer.from(data).toString('hex');
}

function quote(data) {
  return "'\\X" + data + "'";
}

types.add({
  id: 17,
  name: 'bytea',
  array: 1001,
  quote,
  decode: decodeBytea,
  encode: encodeBytea,
  serialize: serializeBytea,
});
