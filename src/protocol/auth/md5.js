import { md5 } from '../../utils/hash.js';
import { textEncoder } from '../../utils/string.js';

import { MESSAGE_PASSWORD } from '../messages.js';

export function md5Password({ reader, writer, options }) {
  const buffer = new Uint8Array(36);

  textEncoder.encodeInto(md5(options.password + options.username), buffer);
  buffer.set(reader.uint8.subarray(reader.offset, reader.offset + 4), 32);

  writer
    .type(MESSAGE_PASSWORD)
    .string('md5' + md5(buffer))
    .end();
}
