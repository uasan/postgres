const decodeRange = ({ view, uint8, offset }) => {
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

const encodeRange = () => {};

export const int4range = {
  id: 3904,
  decode: decodeRange,
  encode: encodeRange,
};

export const numrange = {
  id: 3906,
  decode: decodeRange,
  encode: encodeRange,
};

export const tsrange = {
  id: 3908,
  decode: decodeRange,
  encode: encodeRange,
};

export const tstzrange = {
  id: 3910,
  decode: decodeRange,
  encode: encodeRange,
};

export const daterange = {
  id: 3912,
  decode: decodeRange,
  encode: encodeRange,
};

export const int8range = {
  id: 3926,
  decode: decodeRange,
  encode: encodeRange,
};

export const nummultirange = {
  id: 4532,
  decode: decodeRange,
  encode: encodeRange,
};

export const int4multirange = {
  id: 4451,
  decode: decodeRange,
  encode: encodeRange,
};

export const datemultirange = {
  id: 4535,
  decode: decodeRange,
  encode: encodeRange,
};

export const int8multirange = {
  id: 4536,
  decode: decodeRange,
  encode: encodeRange,
};

export const tsmultirange = {
  id: 4533,
  decode: decodeRange,
  encode: encodeRange,
};

export const tstzmultirange = {
  id: 4534,
  decode: decodeRange,
  encode: encodeRange,
};
