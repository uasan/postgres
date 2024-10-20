import { decodeArray } from '../types/array/decode.js';
import { encodeArray } from '../types/array/encode.js';

//https://github.com/npgsql/doc/blob/main/dev/types.md/#L1

export class Type {
  id = 0;
  name = '';

  type = null;
  array = null;

  decode(reader) {
    return reader.getTextUTF8();
  }

  encode(writer, value) {
    writer.setUTF8(String(value));
  }

  serialize(value) {
    return String(value);
  }
}

export class TypesMap extends Map {
  factory(id) {
    return this.get(id) ?? this.create(id);
  }

  create(id) {
    const type = new Type();

    type.id = id;
    this.set(id, type);

    return type;
  }

  add({ array, ...data }) {
    const type = Object.assign(new Type(), data);

    if (array) {
      this.setArrayType(type, array);
    }

    return this.set(type.id, type);
  }

  setArrayType(type, id) {
    type.array = this.factory(id);

    type.array.type = type;
    type.array.decode = decodeArray;
    type.array.encode = encodeArray;
    type.array.name = type.name + '[]';
  }
}

export const types = new TypesMap();
