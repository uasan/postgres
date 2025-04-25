import { assign } from '#native';
import { decodeArray } from '../types/array/decode.js';
import { encodeArray } from '../types/array/encode.js';
import { serializeArray } from '../types/array/serialize.js';

//https://github.com/npgsql/doc/blob/main/dev/types.md/#L1

export class Type {
  id = 0;
  name = '';
  extension = '';

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

const names = new Map();
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

  getType(id) {
    return types.get(id) ?? this.get(id);
  }

  addType({ array, ...data }) {
    const type = assign(new Type(), data);

    if (array) {
      this.setArrayType(type, array);
    }

    if (type.id) {
      this.set(type.id, type);
    } else if (type.extension) {
      names.set(type.extension + ':' + type.name, type);
    } else {
      names.set('pg_catalog.' + type.name, type);
    }
    return this;
  }

  setType(data) {
    const type = this.factory(data.oid);

    if (type.name === '') {
      type.name = data.name;

      if (names.has(data.ext ?? type.name)) {
        assign(type, names.get(data.ext ?? type.name)).id = data.oid;
      }

      if (data.array) {
        this.setArrayType(type, data.array);
      }
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
