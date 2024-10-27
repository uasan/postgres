import { types } from '../protocol/types.js';
import { byteToHex, hexToByte } from '../utils/hex.js';

const decodeUUID = ({ bytes, offset: i }) =>
  byteToHex[bytes[i]] +
  byteToHex[bytes[i + 1]] +
  byteToHex[bytes[i + 2]] +
  byteToHex[bytes[i + 3]] +
  '-' +
  byteToHex[bytes[i + 4]] +
  byteToHex[bytes[i + 5]] +
  '-' +
  byteToHex[bytes[i + 6]] +
  byteToHex[bytes[i + 7]] +
  '-' +
  byteToHex[bytes[i + 8]] +
  byteToHex[bytes[i + 9]] +
  '-' +
  byteToHex[bytes[i + 10]] +
  byteToHex[bytes[i + 11]] +
  byteToHex[bytes[i + 12]] +
  byteToHex[bytes[i + 13]] +
  byteToHex[bytes[i + 14]] +
  byteToHex[bytes[i + 15]];

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
    bytes[i + 4] = hexToByte[uuid[0]][uuid[1]];
    bytes[i + 5] = hexToByte[uuid[2]][uuid[3]];
    bytes[i + 6] = hexToByte[uuid[4]][uuid[5]];
    bytes[i + 7] = hexToByte[uuid[6]][uuid[7]];
    bytes[i + 8] = hexToByte[uuid[9]][uuid[10]];
    bytes[i + 9] = hexToByte[uuid[11]][uuid[12]];
    bytes[i + 10] = hexToByte[uuid[14]][uuid[15]];
    bytes[i + 11] = hexToByte[uuid[16]][uuid[17]];
    bytes[i + 12] = hexToByte[uuid[19]][uuid[20]];
    bytes[i + 13] = hexToByte[uuid[21]][uuid[22]];
    bytes[i + 14] = hexToByte[uuid[24]][uuid[25]];
    bytes[i + 15] = hexToByte[uuid[26]][uuid[27]];
    bytes[i + 16] = hexToByte[uuid[28]][uuid[29]];
    bytes[i + 17] = hexToByte[uuid[30]][uuid[31]];
    bytes[i + 18] = hexToByte[uuid[32]][uuid[33]];
    bytes[i + 19] = hexToByte[uuid[34]][uuid[35]];
  }
}

types.add({
  id: 2950,
  array: 2951,
  name: 'uuid',
  decode: decodeUUID,
  encode: encodeUUID,
});
