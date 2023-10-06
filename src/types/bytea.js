export const decodeBlob = reader =>
  reader.uint8.slice(reader.offset, reader.ending);

export const encodeBlob = (writer, uint8) => {
  writer.setInt32(uint8.byteLength).setBytes(uint8);
};

export const bytea = {
  id: 17,
  decode: decodeBlob,
  encode: encodeBlob,
};
