import { noop } from '#native';

export const voidType = {
  id: 2278,

  decode: noop,
  encode: noop,

  decodeText: noop,
  encodeText: noop,

  decodeBlob: noop,
  encodeBlob: noop,
};
