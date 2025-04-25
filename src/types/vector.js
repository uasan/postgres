import { types } from '../protocol/types.js';

function decodeVector({ view, offset }) {
  const array = new Float32Array(view.getUint16(offset));

  for (let i = 0; i < array.length; i++) {
    offset += 4;
    array[i] = view.getFloat32(offset);
  }

  return array;
}

function encodeVector(writer, array) {
  let offset = 4 + array.length * 4;
  offset = writer.setUint32(offset).alloc(offset);

  writer.view.setUint16(offset, array.length);
  writer.view.setUint16(offset + 2, 0);

  for (let i = 0; i < array.length; i++) {
    offset += 4;
    writer.view.setFloat32(offset, array[i]);
  }
}

types.addType({
  id: NaN,
  name: 'vector',
  extension: 'vector',
  decode: decodeVector,
  encode: encodeVector,
});
