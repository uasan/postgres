import { types } from '../protocol/types.js';

const decodeBytea = reader => reader.bytes.slice(reader.offset, reader.ending);

function encodeBytea(writer, bytes) {
  writer.setInt32(bytes.byteLength).setBytes(bytes);
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
