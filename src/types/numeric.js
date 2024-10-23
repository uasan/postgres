import { types } from '../protocol/types.js';
import { ceil, POSITIVE_INFINITY, NEGATIVE_INFINITY, identity } from '#native';

function countZeros(text, start, step) {
  let count = 0;
  let { length } = text;

  for (let i = start; i < length; i += step)
    if (text[i] === '0') count++;
    else break;

  return count;
}

function decodeNumeric({ view, offset }) {
  let value = '';

  let digits = view.getUint16(offset);
  let weight = view.getInt16(offset + 2);
  let dscale = view.getUint16(offset + 6);

  //console.log({ digits, weight, dscale });

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

  let integers = weight < 0 ? 0 : weight < digits ? weight + 1 : digits;
  let floats = digits - integers;

  if (integers) {
    value += view.getUint16((offset += 8));

    while (--integers)
      value += (view.getUint16((offset += 2)) + 10000 + '').slice(1);

    if (weight >= digits) value += '0000'.repeat(1 + weight - digits);
  } else {
    offset += 6;
    value += '0';
  }

  if (dscale) {
    value += '.';
    let { length } = value;

    if (weight < -1) value += '0000'.repeat(weight * -1 - 1);

    while (floats--)
      value += (view.getUint16((offset += 2)) + 10000 + '').slice(1);

    length = value.length - length;

    if (length < dscale) value += '0'.repeat(dscale - length);
    else if (length > dscale) value = value.slice(0, dscale - length);
  }

  return value;
}

function encodeNumeric(writer, value) {
  let text = value + '';

  switch (text) {
    case 'NaN':
      writer.setInt32(8).setBytes([0, 0, 0, 0, 192, 0, 0, 0]);
      return;
    case 'Infinity':
      writer.setInt32(8).setBytes([0, 0, 0, 0, 208, 0, 0, 32]);
      return;
    case '-Infinity':
      writer.setInt32(8).setBytes([0, 0, 0, 0, 240, 0, 0, 32]);
      return;
  }

  let digits = 0;
  let weight = 0;
  let sign = 0;
  let dscale = 0;
  let { view, length: i } = writer;

  switch (text[0]) {
    case '-':
      text = text.slice(1);
      sign = 0x4000;
      break;
    case '+':
      text = text.slice(1);
  }

  let count = countZeros(text, 0, 1);
  if (count) text = text.slice(count);

  let { length } = text;
  let point = text.indexOf('.');

  if (point === -1) {
    weight = ceil(length / 4) - 1;
  } else {
    length--;
    dscale = length - point;
    weight = ceil(point / 4) - 1;

    text = text.slice(0, point) + text.slice(point + 1);

    if (dscale % 4) {
      text += '0'.repeat(4 - (dscale % 4));
      ({ length } = text);
    }
  }

  count = countZeros(text, length - 1, -1);
  if (count >= 4) {
    length -= count - (count % 4);
    text = text.slice(0, length);
  }

  digits = ceil(length / 4);

  //console.log({ digits, weight, dscale, text });

  writer.alloc(12 + digits * 2);
  view.setInt32(i, 8 + digits * 2);

  view.setUint16((i += 4), digits);
  view.setInt16((i += 2), weight);
  view.setInt16((i += 2), sign);
  view.setUint16((i += 2), dscale);

  let n = (point > 0 ? point : length) % 4 || 4;
  view.setUint16((i += 2), +text.substr(0, n));

  for (; n < length; n += 4) view.setUint16((i += 2), +text.substr(n, 4));
}

types.add({
  id: 1700,
  array: 1231,
  name: 'numeric',
  quote: identity,
  decode: decodeNumeric,
  encode: encodeNumeric,
});
