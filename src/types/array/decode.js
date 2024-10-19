function decodeBlobValues(reader, type, values) {
  for (let ending = 0, i = 0; i < values.length; i++) {
    ending = reader.getInt32();

    if (ending === -1) values[i] = null;
    else {
      reader.ending = ending += reader.offset;
      values[i] = type.decode(reader);
      reader.offset = ending;
    }
  }
}

export function decodeArray(reader) {
  let levels = reader.getInt32() - 1;

  if (levels === -1) return [];

  reader.offset += 8;

  const length = reader.getInt32();
  const values = new Array(length);

  reader.offset += 4;

  if (levels === 0) decodeBlobValues(reader, this.type, values);
  else {
    let list = values;

    for (let i = 0; i < levels; i++) {
      list = list[0] = new Array(reader.getInt32());
      reader.offset += 4;
    }

    const decodeBlobStruct = (list, levels) => {
      if (levels) decodeBlobStruct(list[0], levels - 1);

      for (let i = 1; i < list.length; i++) {
        let source = list[0];
        let target = (list[i] = new Array(source.length));

        for (let i = 0; i < levels; i++)
          target = target[0] = new Array((source = source[0]).length);

        decodeBlobValues(reader, this.type, target);
        if (levels) decodeBlobStruct(list[i], levels - 1);
      }
    };

    decodeBlobValues(reader, this.type, list);
    decodeBlobStruct(values, levels - 1);
  }

  return values;
}
