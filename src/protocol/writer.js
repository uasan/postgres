import { String, textEncoder } from '../utils/string.js';

export class Writer {
  length = 0;
  offset = 0;
  reject = null;
  promise = null;
  isLocked = true;

  uint8 = new Uint8Array(131072);
  view = new DataView(this.uint8.buffer);

  constructor(client) {
    this.client = client;
  }

  lock() {
    //console.log('LOCK');
    this.isLocked = true;
  }

  unlock() {
    //console.log('UNLOCK');
    this.isLocked = false;
    this.promise ??= this.write();
  }

  alloc(length) {
    this.length += length;

    if (this.length > this.uint8.byteLength) {
      const uint8 = new Uint8Array((this.length + length) << 1);
      uint8.set(this.uint8);
      this.uint8 = uint8;
      this.view = new DataView(uint8.buffer);
      console.log('ALLOC-WRITER', uint8.byteLength);
    }

    return this.uint8;
  }

  async write() {
    let length = 0;
    let offset = 0;
    const { client } = this;

    let task = client.queue?.head;

    const promise = {
      then: (resolve, reject) => {
        length = this.length;
        this.reject = reject;

        client.stream._write(
          this.uint8.subarray(offset, length),
          undefined,
          resolve
        );
      },
    };

    do {
      length = this.length;

      try {
        await promise;
      } catch {
        break;
      }

      if (this.isLocked === false && (task ??= client.queue.head)) {
        while (task?.statement) task = task.next;

        if (task) {
          length = 0;
          offset = 0;

          this.length = 0;
          this.offset = 0;

          while (
            this.isLocked === false &&
            (task = task.send(client)) &&
            this.length < 65536
          );
        }
      }
    } while (this.length && this.length !== (offset = length));

    this.length = 0;
    this.offset = 0;

    this.reject = null;
    this.promise = null;
  }

  clear() {
    this.length = 0;
    this.offset = 0;
    return this.promise;
  }

  type(code) {
    //console.log('WRITE_TYPE', code);
    this.offset = this.length;
    this.alloc(5)[this.offset] = code;
    return this;
  }

  binary(value) {
    const { length } = this;
    this.alloc(value.length).set(value, length);
    return this;
  }

  text(value) {
    try {
      this.length += textEncoder.encodeInto(
        value,
        this.uint8.subarray(this.length)
      ).written;
      return this;
    } catch (error) {
      if (error instanceof RangeError) {
        this.alloc(this.uint8.byteLength);
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
    return this.text(String(value)).view.setInt32(
      length,
      this.length - length - 4
    );
  }

  end() {
    const { offset, length } = this;

    this.view.setInt32(offset + 1, length - offset - 1);
    this.promise ??= this.write();

    return this;
  }
}
