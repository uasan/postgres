import { decodeBlobRecord } from './decode.js';
import { encodeBlobRecord } from './encode.js';

export const record = {
  decode: decodeBlobRecord,
  encode: encodeBlobRecord,
  decodeText: null,
  encodeText: null,
  decodeBlob: decodeBlobRecord,
  encodeBlob: encodeBlobRecord,
};
