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
  let offset = writer.setLength(4 + array.length * 4);

  writer.view.setUint16(offset, array.length);
  writer.view.setUint16(offset + 2, 0);

  for (let i = 0; i < array.length; i++) {
    offset += 4;
    writer.view.setFloat32(offset, array[i]);
  }
}

function decodeHalfVector({ view, offset }) {
  const array = new Array(view.getUint16(offset)); //new Float16Array(view.getUint16(offset));
  offset += 4;

  for (let i = 0; i < array.length; i++) {
    array[i] = view.getFloat16(offset);
    offset += 2;
  }

  return array;
}

function encodeHalfVector(writer, array) {
  let offset = writer.setLength(4 + array.length * 2);

  writer.view.setUint16(offset, array.length);
  writer.view.setUint16(offset + 2, 0);
  offset += 4;

  for (let i = 0; i < array.length; i++) {
    writer.view.setFloat16(offset, array[i]);
    offset += 2;
  }
}

export class SparseVector extends Map {
  dimension = 0;

  constructor(dimension, entries) {
    super(entries).dimension = dimension;
  }
}

function decodeSparseVector({ view, offset }) {
  const map = new SparseVector(view.getUint32(offset));
  const count = view.getUint32(offset + 4);
  offset += 4;

  for (let i = 0; i < count; i++) {
    offset += 8;
    map.set(view.getUint32(offset), view.getFloat32(offset + 4));
  }

  return map;
}

function encodeSparseVector(writer, map) {
  let offset = writer.setLength(12 + map.size * 8);

  writer.view.setUint32(offset, map.dimension);
  writer.view.setUint32(offset + 4, map.size);
  writer.view.setUint32(offset + 8, 0);
  offset += 12;

  for (const [index, value] of map) {
    writer.view.setUint32(offset, index);
    writer.view.setFloat32(offset + 4, value);
    offset += 8;
  }
}

types
  .addType({
    id: NaN,
    name: 'vector',
    extension: 'vector',
    decode: decodeVector,
    encode: encodeVector,
  })
  .addType({
    id: NaN,
    name: 'halfvec',
    extension: 'vector',
    decode: decodeHalfVector,
    encode: encodeHalfVector,
  })
  .addType({
    id: NaN,
    name: 'sparsevec',
    extension: 'vector',
    decode: decodeSparseVector,
    encode: encodeSparseVector,
  });
