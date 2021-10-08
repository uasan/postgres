import { decodeArray } from './decode.js';
import { encodeArray } from './encode.js';

export const typeArrayOf = ({ id, decode, encode }) => ({
  decode: reader => decodeArray(reader, decode),
  encode: (writer, values) => {
    encodeArray(writer, encode, id, values);
  },
});
