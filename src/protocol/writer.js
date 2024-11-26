import { noop } from '#native';
import { textEncoder } from '../utils/string.js';
import { MESSAGE_FLUSH, MESSAGE_SYNC } from './messages.js';
import { BUFFER_LENGTH, BUFFER_MAX_LENGTH } from '../constants.js';

export class Writer {
  length = 0;
  offset = 0;
  reject = noop;
  client = null;
  promise = null;
  subarray = null;
  isLocked = true;

  buffer = new ArrayBuffer(BUFFER_LENGTH, { maxByteLength: BUFFER_MAX_LENGTH });
  bytes = new Uint8Array(this.buffer);
  view = new DataView(this.buffer);

  constructor(client) {
    this.client = client;
  }

  lock() {
    this.isLocked = true;
    return this;
  }

  unlock() {
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
      //console.log('ALLOC-WRITER', this.length);
      try {
        this.buffer.resize(this.length + 1024);
      } catch (error) {
        this.client.abort(error);
      }
    }

    return length;
  }

  promisify = {
    then: (resolve, reject) => {
      this.reject = reject;
      this.client.stream.write(this.subarray, null, resolve);
    },
  };

  async write() {
    let task = this.client.queue.head;

    for (let offset = 0, ending = 0; this.length !== ending; offset = ending) {
      ending = this.length;
      this.subarray = this.bytes.subarray(offset, ending);

      try {
        await this.promisify;
      } catch {
        break;
      }

      if (this.isLocked === false && (task ??= this.client.queue.head)) {
        while (task?.isSent) task = task.next;

        if (task) {
          if (task.isCorked) continue;

          if (this.length === ending) {
            this.length = ending = 0;
            this.offset = offset = 0;
          }

          while (
            (task = task.send()) &&
            this.isLocked === false &&
            this.length < BUFFER_LENGTH
          );
        }
      }
    }

    this.length = 0;
    this.offset = 0;

    this.reject = noop;
    this.promise = null;
    this.subarray = null;
    //this.buffer.resize(BUFFER_LENGTH);
  }

  clear() {
    this.length = 0;
    this.offset = 0;

    this.reject();
    this.promise = null;
    this.subarray = null;
    this.buffer.resize(BUFFER_LENGTH);
    return this;
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
    const size = value.length * 3;

    if (this.length + size > this.buffer.byteLength) {
      this.buffer.resize(this.length + size);
    }

    this.length += textEncoder.encodeInto(
      value,
      this.bytes.subarray(this.length)
    ).written;

    return this;
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
