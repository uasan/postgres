import { now } from '#native';
import { MESSAGE_COPY_DATA } from '../protocol/messages.js';
import { deserializeLSN, serializeLSN } from '../types/number.js';

export class LSN {
  bigint = 0n;
  writer = null;

  constructor({ writer }) {
    this.writer = writer;
  }

  send(bigint) {
    console.log('LSN', bigint);

    this.bigint = bigint;
    this.writer
      .type(MESSAGE_COPY_DATA)
      .setUint8(114)
      .setBigUint64(bigint)
      .setBigUint64(bigint)
      .setBigUint64(bigint)
      .setBigInt64(now())
      .setUint8(0)
      .end();
  }

  setWAL(wal, bigint) {
    if (bigint) {
      this.bigint = bigint;
      wal.state.lsn = bigint;
    }
  }

  setFromString(text) {
    this.bigint = deserializeLSN(text);
    return this.bigint;
  }

  valueOf() {
    return this.bigint;
  }

  toString() {
    return serializeLSN(this.bigint);
  }
}
