import { noop } from '#native';
import { HIGH_WATER_MARK } from '../constants.js';
import { textEncoder } from '../utils/string.js';
import { MESSAGE_FLUSH, MESSAGE_SYNC } from './messages.js';

export class Writer {
  length = 0;
  offset = 0;
  reject = noop;
  client = null;
  promise = null;
  isLocked = true;

  bytes = new Uint8Array(131072);
  view = new DataView(this.bytes.buffer);

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

  alloc(length) {
    this.length += length;

    if (this.length > this.bytes.byteLength) {
      const bytes = new Uint8Array(this.length + 1024);
      bytes.set(this.bytes);
      this.bytes = bytes;
      this.view = new DataView(bytes.buffer);
      //console.log('ALLOC-WRITER', bytes.byteLength);
    }

    return this.bytes;
  }

  async write() {
    let length = 0;
    let offset = 0;
    const { client } = this;

    let task = client.queue.head;

    //if (client.pid) console.trace('WRITE', this.bytes.subarray(0, this.length));

    const promise = {
      then: (resolve, reject) => {
        length = this.length;
        this.reject = reject;

        client.stream._write(
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

      if (this.isLocked === false && (task ??= client.queue.head)) {
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
  }

  type(code) {
    this.offset = this.length;
    this.alloc(5)[this.offset] = code;
    return this;
  }

  setBytes(value) {
    const { length } = this;
    this.alloc(value.length).set(value, length);
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
    const { length } = this;
    this.alloc(1);
    this.setInt8(length, value);
    return this;
  }

  setUint8(value) {
    const { length } = this;
    this.alloc(1)[length] = value;
    return this;
  }

  setInt16(value) {
    const { length } = this;
    this.alloc(2);
    this.view.setInt16(length, value);
    return this;
  }

  setUint16(value) {
    const { length } = this;
    this.alloc(2);
    this.view.setUint16(length, value);
    return this;
  }

  setInt32(value) {
    const { length } = this;
    this.alloc(4);
    this.view.setInt32(length, value);
    return this;
  }

  setUint32(value) {
    const { length } = this;
    this.alloc(4);
    this.view.setUint32(length, value);
    return this;
  }

  setFloat32(value) {
    const { length } = this;
    this.alloc(4);
    this.view.setFloat32(length, value);
    return this;
  }

  setFloat64(value) {
    const { length } = this;
    this.alloc(8);
    this.view.setFloat64(length, value);
    return this;
  }

  setBigInt64(value) {
    const { length } = this;
    this.alloc(8);
    this.view.setBigInt64(length, value);
    return this;
  }

  setUTF8(value) {
    const { length } = this;
    this.alloc(4);
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
