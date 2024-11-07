import { BUFFER_LENGTH } from '../constants.js';
import { textDecoder } from '../utils/string.js';
import { handlers } from './handlers.js';

export class Reader {
  length = 0;
  offset = 0;
  ending = 0;

  client = null;
  paused = false;

  buffer = new ArrayBuffer(BUFFER_LENGTH, { maxByteLength: 1048576 });
  bytes = new Uint8Array(this.buffer);
  view = new DataView(this.buffer);

  constructor(client) {
    this.client = client;
  }

  alloc(length) {
    if (length > this.bytes.byteLength) {
      this.buffer.resize(length);
      //console.log('ALLOC-READER', length);
    }
  }

  getBuffer() {
    return this.length ? this.bytes.subarray(this.length) : this.bytes;
  }

  read(length) {
    let size = 0;
    let offset = 0;

    const { client, bytes, view } = this;

    length += this.length;

    while (length > 4) {
      size = view.getUint32(offset + 1) + 1;

      if (size > length) {
        this.alloc(size + 1024);
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

      if (this.paused) {
        break;
      }

      offset += size;
      length -= size;
    }

    this.length = length;
    if (offset) bytes.set(bytes.subarray(offset, offset + length));
  }

  clear() {
    this.length = 0;
    this.offset = 0;
    this.ending = 0;
    this.buffer.resize(BUFFER_LENGTH);
  }

  pause() {
    this.paused = true;
    this.client.stream.pause();
  }

  resume() {
    this.paused = false;
    this.client.stream.resume();
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
