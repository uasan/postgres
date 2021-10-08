import { parseJSON, stringify } from '../utils/string.js';

const decodeJson = reader => parseJSON(reader.getTextUTF8());
const decodeJsonb = reader => (
  ++reader.offset, parseJSON(reader.getTextUTF8())
);

const encodeJson = (writer, value) => {
  writer.setUTF8(stringify(value));
};

const encodeJsonb = (writer, value) => {
  writer.setUTF8('\x01' + stringify(value));
};

export const json = {
  id: 114,
  decode: decodeJson,
  encode: encodeJson,
};

export const jsonb = {
  id: 3802,
  decode: decodeJsonb,
  encode: encodeJsonb,
};

export const jsonpath = {
  id: 4072,
  decode: decodeJsonb,
  encode: encodeJsonb,
};
