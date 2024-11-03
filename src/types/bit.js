import { types } from '../protocol/types.js';

const decodeBit = reader =>
  reader.bytes.slice(reader.offset + 4, reader.ending);

function encodeBit(writer, bytes) {
  writer
    .setInt32(bytes.byteLength + 4)
    .setInt32(bytes.byteLength * 8)
    .setBytes(bytes);
}

types
  .addType({
    id: 1560,
    array: 1561,
    name: 'bit',
    decode: decodeBit,
    encode: encodeBit,
  })
  .addType({
    id: 1562,
    array: 1563,
    name: 'varbit',
    decode: decodeBit,
    encode: encodeBit,
  });
