import { md5 } from '../utils/hash.js';
import { MESSAGE_PASSWORD } from '../protocol/messages.js';
import { encodeTextInto } from '../utils/string.js';

export const md5Password = (reader, writer, { username, password }) => {
  const buffer = new Uint8Array(36);

  encodeTextInto(md5(password + username), buffer);
  buffer.set(reader.uint8.subarray(reader.offset, reader.offset + 4), 32);

  writer
    .type(MESSAGE_PASSWORD)
    .string('md5' + md5(buffer))
    .end();
};
