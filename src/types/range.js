import { decodeTextASCII, encodeTextASCII } from './text.js';

const decodeBlobRange = ({ view, uint8, offset }) => {
  switch (uint8[offset]) {
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
};

const encodeBlobRange = reader => {};

export const int4range = {
  id: 3904,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};

export const numrange = {
  id: 3906,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};

export const tsrange = {
  id: 3908,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};

export const tstzrange = {
  id: 3910,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};

export const daterange = {
  id: 3912,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};

export const int8range = {
  id: 3926,

  decode: decodeBlobRange,
  encode: encodeBlobRange,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobRange,
  encodeBlob: encodeBlobRange,
};
