import { noop } from '../utils/native.js';

const decodeBlob = reader => reader.uint8.slice(reader.offset, reader.ending);

export const point = {
  id: 600,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const line = {
  id: 628,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const lseg = {
  id: 601,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const box = {
  id: 603,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const path = {
  id: 602,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const polygon = {
  id: 604,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const circle = {
  id: 718,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const cube = {
  id: 16385,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};

export const earth = {
  id: 16476,

  decode: decodeBlob,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: decodeBlob,
  encodeBlob: noop,
};
