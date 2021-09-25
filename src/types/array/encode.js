import { stringify } from '../../utils/string.js';
const { isArray } = Array;

export const toTextArray = data =>
  isArray(data) ? '{' + data.map(toTextArray).join(',') + '}' : stringify(data);

export const encodeTextArray = (writer, array) => {
  writer.setUTF8(toTextArray(array));
};

export const encodeBlobArray = (writer, encode, id, values) => {
  let offset = writer.length;
  const { view } = writer;
  writer.alloc(24);

  let levels = 1;

  if (isArray(values))
    for (let value = values[0]; isArray(value); value = value[0]) levels++;
  else values = [values];

  view.setInt32(offset + 4, levels);
  view.setInt32(offset + 8, 0);
  view.setInt32(offset + 12, id);
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

    if (value === null) writer.setInt32(-1);
    else encode(writer, value);
  }

  view.setInt32(offset, writer.length - offset - 4);
};
