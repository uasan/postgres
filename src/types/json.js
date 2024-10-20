import { types } from '../protocol/types.js';
import { parseJSON, stringify } from '../utils/string.js';

const decodeJson = reader => parseJSON(reader.getTextUTF8());
const decodeJsonb = reader => (
  ++reader.offset, parseJSON(reader.getTextUTF8())
);

function encodeJson(writer, value) {
  writer.setUTF8(stringify(value));
}

function encodeJsonb(writer, value) {
  writer.setUTF8('\x01' + stringify(value));
}

types
  .add({
    id: 114,
    array: 199,
    name: 'json',
    decode: decodeJson,
    encode: encodeJson,
    serialize: stringify,
  })
  .add({
    id: 3802,
    array: 3807,
    name: 'jsonb',
    decode: decodeJsonb,
    encode: encodeJsonb,
    serialize: stringify,
  })
  .add({
    id: 4072,
    array: 4073,
    name: 'jsonpath',
    decode: decodeJsonb,
    encode: encodeJsonb,
    serialize: stringify,
  });
