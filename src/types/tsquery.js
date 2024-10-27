import { types } from '../protocol/types.js';

function decodeTSQuery(reader) {
  return reader.bytes.slice(reader.offset, reader.ending);
}

class Parser {
  pos = 0;
  count = 0;
  length = 0;
  writer = null;

  constructor(writer, text) {
    this.writer = writer;
    this.length = writer.alloc(8);

    while (text.length > this.pos)
      switch (text[this.pos++]) {
        case ' ':
          break;

        case '!':
          this.writeOperator(1);
          break;

        case '&':
          this.writeOperator(2);
          break;

        case '|':
          this.writeOperator(3);
          break;

        case '<':
          this.writeOperator(4);
          break;

        case "'":
          this.writeWord(text, this.getWordFromQuote(text));
          break;
      }

    this.writer.view.setInt32(this.length, writer.length - this.length - 4);
    this.writer.view.setUint32(this.length + 4, this.count);

    //console.log(this.writer.bytes.slice(this.length, this.writer.length));
  }

  getWordFromQuote(text) {
    let i = text.indexOf("'", this.pos);

    if (i === -1) {
      throw null;
    }

    let word = text.slice(this.pos, i);
    this.pos = i + 1;

    if (text[i - 1] === '\\') {
      word = word.slice(0, -1) + this.getWordFromQuote(text);
    }

    return word;
  }

  writeWord(text, value) {
    this.count++;
    this.writer.setUint8(1);

    if (text[this.pos] === ':') {
      this.pos++;
      this.writeWeightPrefix(text);
    } else {
      this.writer.setUint8(0).setUint8(0);
    }
    console.log('writeWord', value);
    this.writer.string(value);
  }

  writeWeightPrefix(text) {
    let weight = 0;
    let prefix = 0;

    loop: while (text.length > this.pos)
      switch (text[this.pos++]) {
        case '*':
          prefix = 1;
          break;

        case 'a':
        case 'A':
          weight += 8;
          break;

        case 'b':
        case 'B':
          weight += 4;
          break;

        case 'c':
        case 'C':
          weight += 2;
          break;

        case 'd':
        case 'D':
          weight += 1;
          break;

        case ' ':
          break loop;

        default:
          throw null;
      }

    this.writer.setUint8(weight).setUint8(prefix);
  }

  writeOperator(id) {
    this.count++;
    this.writer.setUint8(2).setUint8(id);
    console.log('writeOperator', id);
  }
}

function encodeTSQuery(writer, value) {
  new Parser(writer, String(value).trim());
}

types.add({
  id: 3615,
  array: 3645,
  name: 'tsquery',
  decode: decodeTSQuery,
  encode: encodeTSQuery,
});
