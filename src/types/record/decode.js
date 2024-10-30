import { types } from '../../protocol/types.js';

export function decodeRecord(reader) {
  const values = new Array(reader.getInt32());

  for (let ending = 0, i = 0; i < values.length; i++) {
    const type = types.get(reader.getInt32()) ?? types.get(0);
    const length = reader.getInt32();

    if (length === -1) values[i] = null;
    else {
      ending = reader.ending = reader.offset + length;
      values[i] = type.decode(reader);
      reader.offset = ending;
    }
  }

  return values;
}
