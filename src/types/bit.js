import { types } from '../protocol/types.js';

const decodeBit = reader =>
  reader.uint8.slice(reader.offset + 4, reader.ending);

function encodeBit(writer, uint8) {
  writer
    .setInt32(uint8.byteLength + 4)
    .setInt32(uint8.byteLength * 8)
    .setBytes(uint8);
}

types
  .add({
    id: 1560,
    array: 1561,
    name: 'bit',
    decode: decodeBit,
    encode: encodeBit,
  })
  .add({
    id: 1562,
    array: 1563,
    name: 'varbit',
    decode: decodeBit,
    encode: encodeBit,
  });
