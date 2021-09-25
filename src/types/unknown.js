import { encodeTextArray } from './array/encode.js';

const decodeUnknown = reader => reader.getTextUTF8();

const encodeUnknown = (writer, value) => {
  if (typeof value === 'object') encodeTextArray(writer, value);
  else writer.setUTF8(value);
};

export const unknown = {
  id: 0,

  decode: decodeUnknown,
  encode: encodeUnknown,

  decodeText: decodeUnknown,
  encodeText: encodeUnknown,

  decodeBlob: null,
  encodeBlob: null,
};
