import { types } from '../protocol/types.js';

function decodeTSQuery(reader) {
  return reader.bytes.slice(reader.offset, reader.ending);
}

class Parser {
  pos = 0;
  count = 0;

  writer = null;
  operand = null;

  constructor(writer, text) {
    this.writer = writer;

    let word = '';
    let length = writer.alloc(8);

    for (; text.length > this.pos; this.pos++)
      switch (text[this.pos]) {
        case ' ':
          if (word) {
            this.writeWord(text, word);
            word = '';
          }
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

        case ':':
          if (word) {
            this.writeWord(text, word);
            word = '';
          }
          break;

        default:
          word += text[this.pos];
      }

    if (word) {
      this.writeWord(text, word);
    }

    this.writer.view.setInt32(length, writer.length - length - 4);
    this.writer.view.setUint32(length + 4, this.count);

    //   Uint8Array(23) [
    //     0,  0, 0, 5, 2,  2, 1, 0,
    //     1, 99, 0, 2, 2,  1, 0, 0,
    //    98,  0, 1, 0, 0, 97, 0
    //  ]

    // Uint8Array(23) [
    //   0,  0, 0, 5, 2,  2,  1, 0,
    //   0, 97, 0, 1, 0,  0, 98, 0,
    //   2,  2, 1, 0, 1, 99,  0
    // ]

    console.log(this.writer.bytes.slice(length + 4, this.writer.length));
  }

  getWordFromQuote(text) {
    let i = text.indexOf("'", ++this.pos);

    if (i === -1) {
      throw null;
    }

    let word = text.slice(this.pos, i);

    if (text[i + 1] === "'") {
      this.pos = i + 1;
      word += "'" + this.getWordFromQuote(text);
    } else if (text[i - 1] === '\\') {
      this.pos = i;
      word = word.slice(0, -1) + "'" + this.getWordFromQuote(text);
    } else {
      this.pos = i + 1;
    }

    return word;
  }

  writeWeightPrefix(text) {
    let weight = 0;
    let prefix = 0;

    while (text.length > this.pos && text[this.pos] !== ' ')
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

        default:
          throw null;
      }

    this.writer.setUint8(weight).setUint8(prefix);
  }

  writeWord(text, word) {
    const { length } = this.writer;

    this.count++;
    this.writer.setUint8(1);

    if (text[this.pos] === ':') {
      this.pos++;
      this.writeWeightPrefix(text);
    } else {
      this.writer.setUint8(0).setUint8(0);
    }

    if (word.includes('\\')) {
      word = word.replaceAll('\\\\', '\\');
    }

    this.writer.string(word);

    if (text.length > this.pos) {
      this.operand = this.writer.bytes.slice(length, this.writer.length);
      this.writer.length = length;
    }
  }

  writeOperator(id) {
    this.count++;
    this.writer.setUint8(2).setUint8(id);

    if (this.operand) {
      this.writer.setBytes(this.operand);
      this.operand = null;
    }
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
