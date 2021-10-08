import { noop } from '#native';

const decodeGeo = reader => reader.uint8.slice(reader.offset, reader.ending);

export const point = {
  id: 600,
  decode: decodeGeo,
  encode: noop,
};

export const line = {
  id: 628,
  decode: decodeGeo,
  encode: noop,
};

export const lseg = {
  id: 601,
  decode: decodeGeo,
  encode: noop,
};

export const box = {
  id: 603,
  decode: decodeGeo,
  encode: noop,
};

export const path = {
  id: 602,
  decode: decodeGeo,
  encode: noop,
};

export const polygon = {
  id: 604,
  decode: decodeGeo,
  encode: noop,
};

export const circle = {
  id: 718,
  decode: decodeGeo,
  encode: noop,
};

export const cube = {
  id: 16385,
  decode: decodeGeo,
  encode: noop,
};

export const earth = {
  id: 16476,
  decode: decodeGeo,
  encode: noop,
};
