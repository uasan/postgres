const decodeUnknown = reader => reader.getTextUTF8();
const encodeUnknown = (writer, value) => {
  writer.setUTF8(value);
};

export const unknown = {
  id: 0,
  decode: decodeUnknown,
  encode: encodeUnknown,
};
