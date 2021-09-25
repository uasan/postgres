let types;
import('../../protocol/types.js').then(module => {
  types = module.types;
});

export const decodeBlobRecord = reader => {
  const values = new Array(reader.getInt32());

  for (let ending = 0, i = 0; i < values.length; i++) {
    const { decode } = types[reader.getInt32()];
    const length = reader.getInt32();

    if (length === -1) values[i] = null;
    else {
      ending = reader.ending = reader.offset + length;
      values[i] = decode(reader);
      reader.offset = ending;
    }
  }

  return values;
};
