import { noop } from '#native';
import { types } from '../protocol/types.js';

const decodeGeo = reader => reader.bytes.slice(reader.offset, reader.ending);

types
  .addType({
    id: 600,
    array: 1017,
    name: 'point',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 628,
    array: 629,
    name: 'line',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 601,
    array: 1018,
    name: 'lseg',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 603,
    array: 1020,
    name: 'box',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 602,
    array: 1019,
    name: 'path',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 604,
    array: 1027,
    name: 'polygon',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: 718,
    array: 719,
    name: 'circle',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: NaN,
    name: 'cube',
    extension: 'cube',
    decode: decodeGeo,
    encode: noop,
  })
  .addType({
    id: NaN,
    name: 'earth',
    extension: 'earthdistance',
    decode: decodeGeo,
    encode: noop,
  });
