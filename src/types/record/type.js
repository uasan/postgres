import { types } from '../../protocol/types.js';

import { decodeRecord } from './decode.js';
import { encodeRecord } from './encode.js';

types.addType({
  id: 2249,
  array: 2287,
  name: 'record',
  decode: decodeRecord,
  encode: encodeRecord,
});
