import { isNaN, POSITIVE_INFINITY, NEGATIVE_INFINITY } from '#native';

const decodeNumeric = ({ view, offset, ending, uint8 }) => {
  let value = '';
  let digits = view.getUint16(offset);
  let weight = view.getInt16(offset + 2);
  let dscale = view.getUint16(offset + 6);

  switch (view.getUint16(offset + 4)) {
    case 0:
      break;
    case 0x4000:
      value = '-';
      break;
    case 0xc000:
      return NaN;
    case 0xd000:
      return POSITIVE_INFINITY;
    case 0xf000:
      return NEGATIVE_INFINITY;
  }

  offset += 8;
  let length = (ending - offset) / 2 - dscale;

  for (; offset < ending; offset += 2) {
    const digit = view.getUint16(offset);
    value += digit;
  }

  if (dscale) {
    value += '.';
    do {
      const digit = view.getUint16(offset);
      value += digit;
    } while ((offset += 2) < ending);
  }

  console.log({ digits, weight, dscale, value });

  return uint8.slice(offset - ending, ending);
};

const encodeNumeric = (writer, value) => {
  if (isNaN(value)) {
    writer.setInt32(8).binary([0, 0, 0, 0, 192, 0, 0, 0]);
  } else if (value === POSITIVE_INFINITY) {
    writer.setInt32(8).binary([0, 0, 0, 0, 208, 0, 0, 32]);
  } else if (value === NEGATIVE_INFINITY) {
    writer.setInt32(8).binary([0, 0, 0, 0, 240, 0, 0, 32]);
  } else {
    writer.setUTF8(value);
  }
};

export const numeric = {
  id: 1700,
  decode: decodeNumeric,
  encode: encodeNumeric,
};
