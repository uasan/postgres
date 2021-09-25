import { parseJSON, stringify } from '../utils/string.js';

const decodeTextJson = reader => parseJSON(reader.getTextUTF8());
const encodeTextJson = (writer, value) => {
  writer.setUTF8(stringify(value));
};

const decodeBlobJsonb = reader => (
  ++reader.offset, parseJSON(reader.getTextUTF8())
);

const encodeBlobJsonb = (writer, value) => {
  writer.setUTF8('\x01' + stringify(value));
};

export const json = {
  id: 114,

  decode: decodeTextJson,
  encode: encodeTextJson,

  decodeText: decodeTextJson,
  encodeText: encodeTextJson,

  decodeBlob: decodeTextJson,
  encodeBlob: encodeTextJson,
};

export const jsonb = {
  id: 3802,

  decode: decodeTextJson,
  encode: encodeTextJson,

  decodeText: decodeTextJson,
  encodeText: encodeTextJson,

  decodeBlob: decodeBlobJsonb,
  encodeBlob: encodeBlobJsonb,
};
