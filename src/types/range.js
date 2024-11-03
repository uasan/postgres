import { types } from '../protocol/types.js';

function decodeRange({ view, bytes, offset }) {
  switch (bytes[offset]) {
    case 1:
      return [];
    case 2:
      return [view.getInt32(offset + 5), view.getInt32(offset + 13)];
    case 8:
      return [null, view.getInt32(offset + 5)];
    case 18:
      return [view.getInt32(offset + 5), null];
    default:
      return [null, null];
  }
}

function encodeRange() {}

types
  .addType({
    id: 3904,
    array: 3905,
    name: 'int4range',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 3906,
    array: 3907,
    name: 'numrange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 3908,
    array: 3909,
    name: 'tsrange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 3910,
    array: 3911,
    name: 'tstzrange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 3912,
    array: 3913,
    name: 'daterange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 3926,
    array: 3927,
    name: 'int8range',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4532,
    array: 6151,
    name: 'nummultirange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4451,
    array: 6150,
    name: 'int4multirange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4535,
    array: 6155,
    name: 'datemultirange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4536,
    array: 6157,
    name: 'int8multirange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4533,
    array: 6152,
    name: 'tsmultirange',
    decode: decodeRange,
    encode: encodeRange,
  })
  .addType({
    id: 4534,
    array: 6153,
    name: 'tstzmultirange',
    decode: decodeRange,
    encode: encodeRange,
  });
