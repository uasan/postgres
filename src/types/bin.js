import { decodeTextASCII, encodeTextASCII } from './text.js';

export const decodeBlob = reader =>
  reader.uint8.subarray(reader.offset, reader.ending);

export const encodeBlob = (writer, uint8) => {
  writer.setInt32(uint8.byteLength).binary(uint8);
};

export const bytea = {
  id: 17,
  decodeBlob,
  encodeBlob,

  decode: decodeBlob,
  encode: encodeBlob,

  decodeText: decodeBlob,
  encodeText: encodeBlob,
};

export const bit = {
  id: 1560,
  decodeBlob,
  encodeBlob,

  decode: decodeBlob,
  encode: encodeBlob,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,
};

export const varbit = { ...bit, id: 1562 };
