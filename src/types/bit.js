const decodeBit = reader =>
  reader.uint8.slice(reader.offset + 4, reader.ending);

function encodeBit(writer, uint8) {
  writer
    .setInt32(uint8.byteLength + 4)
    .setInt32(uint8.byteLength * 8)
    .setBytes(uint8);
}

export const bit = {
  id: 1560,
  decode: decodeBit,
  encode: encodeBit,
};

export const varbit = {
  id: 1562,
  decode: decodeBit,
  encode: encodeBit,
};
