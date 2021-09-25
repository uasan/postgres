import { byteToHex, hexToByte } from '../utils/hex.js';
import { decodeTextASCII, encodeTextASCII } from './text.js';

const decodeBlobUUID = ({ uint8, offset: i }) =>
  byteToHex[uint8[i]] +
  byteToHex[uint8[i + 1]] +
  byteToHex[uint8[i + 2]] +
  byteToHex[uint8[i + 3]] +
  '-' +
  byteToHex[uint8[i + 4]] +
  byteToHex[uint8[i + 5]] +
  '-' +
  byteToHex[uint8[i + 6]] +
  byteToHex[uint8[i + 7]] +
  '-' +
  byteToHex[uint8[i + 8]] +
  byteToHex[uint8[i + 9]] +
  '-' +
  byteToHex[uint8[i + 10]] +
  byteToHex[uint8[i + 11]] +
  byteToHex[uint8[i + 12]] +
  byteToHex[uint8[i + 13]] +
  byteToHex[uint8[i + 14]] +
  byteToHex[uint8[i + 15]];

const encodeBlobUUID = (writer, uuid) => {
  const i = writer.length;
  const uint8 = writer.alloc(20);
  uint8[i] = 0;
  uint8[i + 1] = 0;
  uint8[i + 2] = 0;
  uint8[i + 3] = 16;
  uint8[i + 4] = hexToByte[uuid[0]][uuid[1]];
  uint8[i + 5] = hexToByte[uuid[2]][uuid[3]];
  uint8[i + 6] = hexToByte[uuid[4]][uuid[5]];
  uint8[i + 7] = hexToByte[uuid[6]][uuid[7]];
  uint8[i + 8] = hexToByte[uuid[9]][uuid[10]];
  uint8[i + 9] = hexToByte[uuid[11]][uuid[12]];
  uint8[i + 10] = hexToByte[uuid[14]][uuid[15]];
  uint8[i + 11] = hexToByte[uuid[16]][uuid[17]];
  uint8[i + 12] = hexToByte[uuid[19]][uuid[20]];
  uint8[i + 13] = hexToByte[uuid[21]][uuid[22]];
  uint8[i + 14] = hexToByte[uuid[24]][uuid[25]];
  uint8[i + 15] = hexToByte[uuid[26]][uuid[27]];
  uint8[i + 16] = hexToByte[uuid[28]][uuid[29]];
  uint8[i + 17] = hexToByte[uuid[30]][uuid[31]];
  uint8[i + 18] = hexToByte[uuid[32]][uuid[33]];
  uint8[i + 19] = hexToByte[uuid[34]][uuid[35]];
};

export const uuid = {
  id: 2950,

  decode: decodeBlobUUID,
  encode: encodeBlobUUID,

  decodeText: decodeTextASCII,
  encodeText: encodeTextASCII,

  decodeBlob: decodeBlobUUID,
  encodeBlob: encodeBlobUUID,
};
