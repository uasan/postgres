export const decodeBlob = reader =>
  reader.uint8.subarray(reader.offset, reader.ending);

export const encodeBlob = (writer, uint8) => {
  writer.setInt32(uint8.byteLength).binary(uint8);
};

export const bytea = {
  id: 17,
  decode: decodeBlob,
  encode: encodeBlob,
};

export const bit = {
  id: 1560,
  decode: decodeBlob,
  encode: encodeBlob,
};

export const varbit = {
  id: 1562,
  decode: decodeBlob,
  encode: encodeBlob,
};
