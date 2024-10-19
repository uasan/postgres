const { isArray } = Array;

export function encodeArray(writer, values) {
  let offset = writer.length;

  const { type } = this;
  const { view } = writer;
  //console.log('encodeArray', type.id, values);
  writer.alloc(24);

  let levels = 1;

  if (isArray(values))
    for (let value = values[0]; isArray(value); value = value[0]) levels++;
  else values = [values];

  view.setInt32(offset + 4, levels);
  view.setInt32(offset + 8, 0);
  view.setInt32(offset + 12, type.id);
  view.setInt32(offset + 16, values.length);
  view.setInt32(offset + 20, 1);

  if (levels !== 1) {
    for (let list = values[0], i = 1; i < levels; i++) {
      writer.setInt32(list.length);
      writer.setInt32(1);
      list = list[0];
    }
    values = values.flat(levels);
  }

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value == null) writer.setInt32(-1);
    else type.encode(writer, value);
  }

  view.setInt32(offset, writer.length - offset - 4);
}
