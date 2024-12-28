import { textDecoder } from '../utils/string.js';

export class Message {
  type = '';

  offset = 0;
  length = 0;
  buffer = null;

  constructor(reader) {
    this.type = reader.getString();

    this.buffer = reader.buffer;
    this.offset = reader.offset + 4;
    this.length = reader.getUint32();
  }

  arrayBuffer() {
    return this.buffer.slice(this.offset, this.offset + this.length);
  }

  bytes() {
    return new Uint8Array(this.arrayBuffer());
  }

  text() {
    return textDecoder.decode(
      new Uint8Array(this.buffer, this.offset, this.length)
    );
  }

  json() {
    return JSON.parse(this.text());
  }
}
