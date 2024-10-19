import { ensureNetNum, parseInt16 } from '../utils/number.js';

function decodeInet(reader) {
  let ip = '';

  const mask = reader.uint8[reader.offset + 1];
  const length = reader.uint8[reader.offset + 3];

  if (reader.uint8[reader.offset] === 2) {
    let k = reader.offset + 4;

    for (let i = 0; i < 4; i++) {
      if (i) ip += '.';
      ip += i >= length ? 0 : reader.uint8[k + i];
    }
  } else {
    reader.offset += 4;

    for (let i = 0; i < 8; i++) {
      if (i) ip += ':';

      const n = reader.getUint16();

      if (n) {
        ip += n.toString(16);
      } else {
        i++;
        reader.offset += 2;
      }
    }
  }

  if (mask) ip += '/' + mask;
  return ip;
}

function encodeInet(writer, data) {
  let mask = 0;
  let kind = this.id === 650 ? 1 : 0;

  data = String(data);

  if (data.includes('/')) {
    mask = ensureNetNum(Number(data.slice(data.indexOf('/') + 1)));
    data = data.slice(0, data.indexOf('/'));
  }

  if (data.includes(':')) {
    const list = data.split(':');

    if (list.length > 8) {
      throw null;
    }

    writer.setInt32(20).setUint8(3).setUint8(mask).setUint8(kind).setUint8(16);

    for (let i = 0; i < list.length; i++) {
      if (list[i]) {
        writer.setUint16(parseInt16(list[i]));
      } else {
        writer.setUint32(0);
      }
    }
  } else {
    const list = data.split('.');

    if (list.length !== 4) {
      throw null;
    }

    writer.setInt32(8).setUint8(2).setUint8(mask).setUint8(kind).setUint8(4);

    for (let i = 0; i < 4; i++) {
      writer.setUint8(ensureNetNum(Number(list[i])));
    }
  }
}

export const inet = {
  id: 869,
  name: 'inet',
  decode: decodeInet,
  encode: encodeInet,
};

export const cidr = {
  id: 650,
  name: 'cidr',
  decode: decodeInet,
  encode: encodeInet,
};

export const macaddr = {
  id: 829,
  name: 'macaddr',
  decode: decodeInet,
  encode: encodeInet,
};

export const macaddr8 = {
  id: 774,
  name: 'macaddr8',
  decode: decodeInet,
  encode: encodeInet,
};
