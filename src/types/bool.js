const decodeTextBoolean = reader => reader.uint8[reader.offset] === 116;
const encodeTextBoolean = (writer, value) =>
  writer.setInt32(1).setInt8(value === true ? 116 : 102);

const decodeBlobBoolean = reader => reader.uint8[reader.offset] === 1;
const encodeBlobBoolean = (writer, value) => {
  writer.setInt32(1).setInt8(value === true ? 1 : 0);
};

export const bool = {
  id: 16,

  decode: decodeBlobBoolean,
  encode: encodeBlobBoolean,

  decodeText: decodeTextBoolean,
  encodeText: encodeTextBoolean,

  decodeBlob: decodeBlobBoolean,
  encodeBlob: encodeBlobBoolean,
};
