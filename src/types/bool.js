const decodeBoolean = reader => reader.uint8[reader.offset] === 1;
function encodeBoolean(writer, value) {
  writer.setInt32(1).setUint8(value === true ? 1 : 0);
}

export const bool = {
  id: 16,
  decode: decodeBoolean,
  encode: encodeBoolean,
};
