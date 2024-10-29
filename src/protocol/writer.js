import { noop } from '#native';
import { BUFFER_LENGTH, HIGH_WATER_MARK } from '../constants.js';
import { textEncoder } from '../utils/string.js';
import { MESSAGE_FLUSH, MESSAGE_SYNC } from './messages.js';

export class Writer {
  length = 0;
  offset = 0;
  reject = noop;
  client = null;
  promise = null;
  isLocked = true;

  buffer = new ArrayBuffer(BUFFER_LENGTH, { maxByteLength: 1048576 });
  bytes = new Uint8Array(this.buffer);
  view = new DataView(this.buffer);

  constructor(client) {
    this.client = client;
  }

  lock() {
    //console.log('LOCK');
    this.isLocked = true;
    return this;
  }

  unlock() {
    //console.log('UNLOCK');
    this.isLocked = false;

    if (this.length) {
      this.promise ??= this.write();
    }

    return this;
  }

  alloc(size) {
    const { length } = this;

    this.length += size;

    if (this.length > this.buffer.byteLength) {
      this.buffer.resize(this.length + 1024);

      console.log('ALLOC-WRITER', this.buffer.byteLength);
    }

    return length;
  }

  async write() {
    let length = 0;
    let offset = 0;
    let task = this.client.queue.head;

    const promise = {
      then: (resolve, reject) => {
        length = this.length;
        this.reject = reject;

        this.client.stream._write(
          this.bytes.subarray(offset, length),
          undefined,
          resolve
        );
      },
    };

    do {
      try {
        if (await promise) break;
      } catch {
        break;
      }

      if (this.isLocked === false && (task ??= this.client.queue.head)) {
        while (task?.isSent) task = task.next;

        if (task) {
          if (task.isCorked) break;

          this.length = length = 0;
          this.offset = offset = 0;

          while (
            this.isLocked === false &&
            (task = task.send()) &&
            this.length < HIGH_WATER_MARK
          );
        }
      }
    } while (this.length && this.length !== (offset = length));

    this.length = 0;
    this.offset = 0;

    this.reject = noop;
    this.promise = null;
  }

  clear() {
    this.length = 0;
    this.offset = 0;

    this.reject();
    this.promise = null;
    this.buffer.resize(BUFFER_LENGTH);
  }

  type(code) {
    this.offset = this.alloc(5);
    this.bytes[this.offset] = code;
    return this;
  }

  setBytes(value) {
    this.bytes.set(value, this.alloc(value.length));
    return this;
  }

  text(value) {
    try {
      this.length += textEncoder.encodeInto(
        value,
        this.bytes.subarray(this.length)
      ).written;
      return this;
    } catch (error) {
      if (error instanceof RangeError) {
        this.alloc(this.bytes.byteLength);
        return this.text(value);
      }
      throw error;
    }
  }

  string(value) {
    return this.text(value + '\x00');
  }

  setInt8(value) {
    this.view.setInt8(this.alloc(1), value);
    return this;
  }

  setUint8(value) {
    this.bytes[this.alloc(1)] = value;
    return this;
  }

  setInt16(value) {
    this.view.setInt16(this.alloc(2), value);
    return this;
  }

  setUint16(value) {
    this.view.setUint16(this.alloc(2), value);
    return this;
  }

  setInt32(value) {
    this.view.setInt32(this.alloc(4), value);
    return this;
  }

  setUint32(value) {
    this.view.setUint32(this.alloc(4), value);
    return this;
  }

  setFloat32(value) {
    this.view.setFloat32(this.alloc(4), value);
    return this;
  }

  setFloat64(value) {
    this.view.setFloat64(this.alloc(8), value);
    return this;
  }

  setBigInt64(value) {
    this.view.setBigInt64(this.alloc(8), value);
    return this;
  }

  setUTF8(value) {
    const length = this.alloc(4);
    this.text(value).view.setInt32(length, this.length - length - 4);
    return this;
  }

  clearLastMessage() {
    this.length = this.offset;
    return this;
  }

  flush() {
    return this.type(MESSAGE_FLUSH).end();
  }

  sync() {
    return this.type(MESSAGE_SYNC).end();
  }

  end() {
    this.view.setInt32(this.offset + 1, this.length - this.offset - 1);
    this.promise ??= this.write();
    return this;
  }
}
