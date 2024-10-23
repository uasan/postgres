import { decodeArray } from '../types/array/decode.js';
import { encodeArray } from '../types/array/encode.js';
import { serializeArray } from '../types/array/serialize.js';

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

  quote(value) {
    return "'" + value.replaceAll("'", "''") + "'";
  }

  getSQL(value) {
    return value == null ? 'NULL' : this.quote(this.serialize(value));
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

  setType(data) {
    const type = this.factory(data.oid);

    if (type.name) {
      return;
    }

    type.name = data.name;

    if (data.array) {
      this.setArrayType(type, data.array);
    }
  }

  setArrayType(type, id) {
    type.array = this.factory(id);

    type.array.type = type;
    type.array.name = type.name + '[]';

    type.array.decode = decodeArray;
    type.array.encode = encodeArray;
    type.array.serialize = serializeArray;
  }
}

export const types = new TypesMap();
