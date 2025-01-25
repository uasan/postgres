function setValues(reader, type, values) {
  for (let ending = 0, i = 0; i < values.length; i++) {
    ending = reader.getInt32();

    if (ending === -1) {
      values[i] = null;
      reader.ending = reader.offset;
    } else {
      reader.ending = ending += reader.offset;
      values[i] = type.decode(reader);
      reader.offset = ending;
    }
  }
}

function setStruct(reader, type, list, levels) {
  if (levels) setStruct(reader, type, list[0], levels - 1);

  for (let i = 1; i < list.length; i++) {
    let source = list[0];
    let target = (list[i] = new Array(source.length));

    for (let i = 0; i < levels; i++) {
      source = source[0];
      target = target[0] = new Array(source.length);
    }

    setValues(reader, type, target);
    if (levels) setStruct(reader, type, list[i], levels - 1);
  }
}

export function decodeArray(reader) {
  const levels = reader.getInt32() - 1;

  if (levels === -1) return [];

  reader.offset += 8;
  const values = new Array(reader.getInt32());
  reader.offset += 4;

  if (levels === 0) {
    setValues(reader, this.type, values);
  } else {
    let list = values;

    for (let i = 0; i < levels; i++) {
      list = list[0] = new Array(reader.getInt32());
      reader.offset += 4;
    }

    setValues(reader, this.type, list);
    setStruct(reader, this.type, values, levels - 1);
  }

  return values;
}
