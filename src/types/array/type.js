import { decodeArray } from './decode.js';
import { encodeArray } from './encode.js';

export const typeArrayOf = type => ({
  type,
  name: type.name + '[]',
  decode: decodeArray,
  encode: encodeArray,
});
