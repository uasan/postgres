import { types } from '../protocol/types.js';

function decodeTSQuery(reader) {
  return reader.uint8.slice(reader.offset, reader.ending);
}

class Parser extends Array {
  constructor(text) {
    super();

    let word = '';

    for (let i = 0; text.length > i; )
      switch (text[i++]) {
        case '\\':
          break;

        case "'":
          {
            const n = text.indexOf("'", i);
            word = text.slice(i, n);
            console.log(i, n, text.slice(i, n));
          }

          break;
      }
  }
}

function encodeTSQuery(writer, value) {
  const tokens = new Parser(String(value).trim());

  writer
    .setInt32(9)
    .setUint32(1)
    .setUint8(1)
    .setUint8(1)
    .setUint8(1)
    .setUint8(97)
    .setUint8(0);
  console.log(tokens);
}

types.add({
  id: 3615,
  array: 3645,
  name: 'tsquery',
  decode: decodeTSQuery,
  encode: encodeTSQuery,
});
