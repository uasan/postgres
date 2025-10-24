import { types } from '../protocol/types.js';

const hex = Array.from({ length: 256 }, (_, i) =>
  (i + 0x100).toString(16).slice(1)
);

const decodeUUID = ({ bytes, offset: i }) =>
  hex[bytes[i]] +
  hex[bytes[i + 1]] +
  hex[bytes[i + 2]] +
  hex[bytes[i + 3]] +
  '-' +
  hex[bytes[i + 4]] +
  hex[bytes[i + 5]] +
  '-' +
  hex[bytes[i + 6]] +
  hex[bytes[i + 7]] +
  '-' +
  hex[bytes[i + 8]] +
  hex[bytes[i + 9]] +
  '-' +
  hex[bytes[i + 10]] +
  hex[bytes[i + 11]] +
  hex[bytes[i + 12]] +
  hex[bytes[i + 13]] +
  hex[bytes[i + 14]] +
  hex[bytes[i + 15]];

function encodeUUID(writer, uuid) {
  const i = writer.alloc(20);
  const { bytes } = writer;

  bytes[i] = 0;
  bytes[i + 1] = 0;
  bytes[i + 2] = 0;
  bytes[i + 3] = 16;

  if (uuid.length === 16) {
    bytes.set(uuid, i + 4);
  } else {
    let v = 0;
    bytes[i + 4] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    bytes[i + 5] = (v >>> 16) & 0xff;
    bytes[i + 6] = (v >>> 8) & 0xff;
    bytes[i + 7] = v & 0xff;
    bytes[i + 8] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    bytes[i + 9] = v & 0xff;
    bytes[i + 10] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    bytes[i + 11] = v & 0xff;
    bytes[i + 12] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    bytes[i + 13] = v & 0xff;
    bytes[i + 14] =
      ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff;
    bytes[i + 15] = (v / 0x100000000) & 0xff;
    bytes[i + 16] = (v >>> 24) & 0xff;
    bytes[i + 17] = (v >>> 16) & 0xff;
    bytes[i + 18] = (v >>> 8) & 0xff;
    bytes[i + 19] = v & 0xff;
  }
}

types.addType({
  id: 2950,
  array: 2951,
  name: 'uuid',
  decode: decodeUUID,
  encode: encodeUUID,
});
