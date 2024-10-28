import { textDecoder } from '../utils/string.js';
import { handlers } from './handlers.js';

export class Reader {
  length = 0;
  offset = 0;
  ending = 0;

  client = null;

  buffer = new ArrayBuffer(131072, { maxByteLength: 1048576 });
  bytes = new Uint8Array(this.buffer);
  view = new DataView(this.buffer);

  constructor(client) {
    this.client = client;
  }

  alloc(length) {
    if (length - this.bytes.byteLength > 1024) {
      this.buffer.resize(this.bytes.byteLength + length + 1024);
      console.log('ALLOC-READER', this.buffer.byteLength);
    }
  }

  getBuffer = () =>
    this.length ? this.bytes.subarray(this.length) : this.bytes;

  read(length) {
    let size = 0;
    let offset = 0;

    const { client, bytes, view } = this;

    if (client.stream === null) return;
    length += this.length;

    while (length > 4) {
      size = view.getUint32(offset + 1) + 1;

      if (size > length) {
        this.alloc(size);
        break;
      }

      const handle = handlers[bytes[offset]];
      //console.log(handle.name, size);

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
    if (offset) this.bytes.set(bytes.subarray(offset, offset + length));
  }

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

  getUint16() {
    const int16 = this.view.getUint16(this.offset);
    this.offset += 2;
    return int16;
  }

  getInt32() {
    const int32 = this.view.getInt32(this.offset);
    this.offset += 4;
    return int32;
  }

  getTextUTF8() {
    return textDecoder.decode(this.bytes.subarray(this.offset, this.ending));
  }

  getString() {
    let text = '';
    const length = this.ending - 1;

    for (let i = this.offset; i < length; i++)
      text += String.fromCharCode(this.bytes[i]);

    return text;
  }
}
