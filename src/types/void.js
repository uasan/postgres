import { noop } from '../utils/native.js';

export const voidType = {
  id: 2278,

  decode: noop,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: noop,
  encodeBlob: noop,
};
