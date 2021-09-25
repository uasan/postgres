import { decodeBlobArray, decodeTextArray } from './decode.js';
import { encodeBlobArray, encodeTextArray } from './encode.js';

export const typeArrayOf = ({ id, decodeBlob, encodeBlob }) => {
  const decode = reader => decodeBlobArray(reader, decodeBlob);
  const encode = (writer, values) => {
    encodeBlobArray(writer, encodeBlob, id, values);
  };

  return {
    decode,
    encode,
    decodeBlob: decode,
    encodeBlob: encode,
    decodeText: decodeTextArray,
    encodeText: encodeTextArray,
  };
};
