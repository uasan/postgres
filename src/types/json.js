import { types } from '../protocol/types.js';
import { parseJSON, stringify } from '../utils/string.js';

const decodeJson = reader => parseJSON(reader.getTextUTF8());

const decodeJsonb = reader => (
  ++reader.offset, parseJSON(reader.getTextUTF8())
);

const decodeJsonPath = reader => (++reader.offset, reader.getTextUTF8());

function encodeJson(writer, value) {
  writer.setUTF8(stringify(value));
}

function encodeJsonb(writer, value) {
  writer.setUTF8('\x01' + stringify(value));
}

function encodeJsonPath(writer, value) {
  writer.setUTF8('\x01' + value);
}

types
  .addType({
    id: 114,
    array: 199,
    name: 'json',
    decode: decodeJson,
    encode: encodeJson,
    serialize: stringify,
  })
  .addType({
    id: 3802,
    array: 3807,
    name: 'jsonb',
    decode: decodeJsonb,
    encode: encodeJsonb,
    serialize: stringify,
  })
  .addType({
    id: 4072,
    array: 4073,
    name: 'jsonpath',
    decode: decodeJsonPath,
    encode: encodeJsonPath,
    serialize: stringify,
  });
