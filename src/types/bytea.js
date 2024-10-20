import { types } from '../protocol/types.js';

export const decodeBlob = reader =>
  reader.uint8.slice(reader.offset, reader.ending);

export function encodeBlob(writer, uint8) {
  writer.setInt32(uint8.byteLength).setBytes(uint8);
}

types.add({
  id: 17,
  name: 'bytea',
  array: 1001,
  decode: decodeBlob,
  encode: encodeBlob,
});
