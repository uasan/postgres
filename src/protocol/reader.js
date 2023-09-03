import { textDecoder } from '../utils/string.js';
import { handlers } from './handlers.js';

export class Reader {
  length = 0;
  offset = 0;
  ending = 0;

  constructor(client) {
    this.client = client;
    this.uint8 = new Uint8Array(131072);
    this.view = new DataView(this.uint8.buffer);
  }

  alloc(length) {
    if (length - this.uint8.byteLength > 1024) {
      this.uint8 = new Uint8Array(this.uint8.byteLength + length + 1024);
      this.view = new DataView(this.uint8.buffer);
      //console.log('ALLOC-READER', this.uint8.byteLength);
    }
    return this.uint8;
  }

  getBuffer = () =>
    this.length ? this.uint8.subarray(this.length) : this.uint8;

  read = length => {
    let size = 0;
    let offset = 0;
    let { client, uint8, view } = this;

    if (client.stream === null) return;
    length += this.length;

    while (length > 4) {
      size = view.getUint32(offset + 1) + 1;

      if (size > length) {
        this.alloc(size);
        break;
      }

      const handle = handlers[uint8[offset]];
      //if (client.pid) console.log(handle?.name);

      try {
        this.offset = offset + 5;
        this.ending = offset + size;
        handle(client);
      } catch (error) {
        client.abort(error);
        return;
      }

      if (size === length) {
        this.clear();
        return;
      }

      offset += size;
      length -= size;
    }

    this.length = length;
    if (offset) this.uint8.set(uint8.subarray(offset, offset + length));
  };

  clear() {
    this.length = 0;
    this.offset = 0;
    this.ending = 0;
  }

  getInt16() {
    const int16 = this.view.getInt16(this.offset);
    this.offset += 2;
    return int16;
  }

  getInt32() {
    const int32 = this.view.getInt32(this.offset);
    this.offset += 4;
    return int32;
  }

  getTextUTF8() {
    return textDecoder.decode(this.uint8.subarray(this.offset, this.ending));
  }
}
