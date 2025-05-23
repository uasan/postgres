import { handlers } from './handlers.js';
import { textDecoder } from '../utils/string.js';
import { PostgresError } from '../response/error.js';
import { BUFFER_LENGTH, BUFFER_MAX_LENGTH } from '../constants.js';

export class Reader {
  offset = 0;
  length = 0;
  ending = 0;

  client = null;
  isPaused = false;

  buffer = new ArrayBuffer(BUFFER_LENGTH, { maxByteLength: BUFFER_MAX_LENGTH });
  bytes = new Uint8Array(this.buffer);
  view = new DataView(this.buffer);

  constructor(client) {
    this.client = client;
  }

  alloc() {
    const length = this.buffer.byteLength + BUFFER_LENGTH;

    if (length > BUFFER_MAX_LENGTH) {
      this.client.abort(PostgresError.of('Overflow buffer reader'));
    } else {
      //console.log('ALLOC-READER', this.buffer.byteLength, length);
      try {
        this.buffer.resize(length);
      } catch (error) {
        this.client.abort(error);
      }
    }
  }

  getBuffer() {
    if (this.length) {
      if (this.buffer.byteLength - this.length < 5) {
        this.alloc();
      }

      if (this.offset) {
        this.bytes.set(new Uint8Array(this.buffer, this.offset, this.length));
        this.offset = 0;
      }

      return new Uint8Array(this.buffer, this.length);
    } else {
      this.offset = 0;
      this.buffer.resize(BUFFER_LENGTH);

      return this.bytes;
    }
  }

  read(length) {
    if (this.isPaused) {
      this.length += length;
      return;
    }

    let size = 0;
    let offset = this.offset;

    length += this.length;

    while (length > 4) {
      size = this.view.getUint32(offset + 1) + 1;

      if (size > length) {
        break;
      }

      const handle = handlers[this.bytes[offset]];

      //console.log(handle.name);

      this.offset = offset + 5;
      this.ending = offset + size;

      try {
        handle(this.client);
      } catch (error) {
        this.client.abort(error);
        break;
      }

      offset += size;
      length -= size;

      if (this.isPaused) {
        break;
      }
    }

    this.offset = offset;
    this.length = length;
  }

  clear() {
    this.offset = 0;
    this.length = 0;
    this.ending = 0;

    this.isPaused = false;
    this.buffer.resize(BUFFER_LENGTH);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.length > 4) {
        this.read(0);
      }
    }
  }

  getInt8() {
    const int8 = this.view.getInt8(this.offset);
    this.offset += 1;
    return int8;
  }

  getUint8() {
    const int8 = this.bytes[this.offset];
    this.offset += 1;
    return int8;
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

  getUint32() {
    const int32 = this.view.getUint32(this.offset);
    this.offset += 4;
    return int32;
  }

  getBigInt64() {
    const int64 = this.view.getBigInt64(this.offset);
    this.offset += 8;
    return int64;
  }

  getBigUint64() {
    const int64 = this.view.getBigUint64(this.offset);
    this.offset += 8;
    return int64;
  }

  getTextUTF8() {
    return textDecoder.decode(this.bytes.subarray(this.offset, this.ending));
  }

  getString() {
    return textDecoder.decode(
      this.bytes.subarray(
        this.offset,
        (this.offset = this.bytes.indexOf(0, this.offset) + 1) - 1
      )
    );
  }

  getAscii(length = this.ending) {
    let text = '';

    for (let i = this.offset; i < length; i++)
      text += String.fromCharCode(this.bytes[i]);

    return text;
  }

  decode(decoder) {
    const length = this.getInt32();

    if (length === -1) return null;
    else {
      this.ending = this.offset + length;
      const value = decoder.decode(this);
      this.offset = this.ending;
      return value;
    }
  }
}
