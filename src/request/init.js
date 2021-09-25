import { md5Password } from '../auth/md5.js';
import { saslHandshake, saslContinue, saslFinal } from '../auth/sasl.js';

export const backendKeyData = connect => {
  connect.pid = connect.reader.getInt32();
  connect.secret = connect.reader.getInt32();
};

export const handshake = (writer, { username, database, params }) => {
  const keys = Object.keys(params);
  let text = 'user\x00' + username + '\x00database\x00' + database;

  for (let i = 0; i < keys.length; i++)
    text += '\x00' + keys[i] + '\x00' + params[keys[i]];

  writer.alloc(8);
  writer.text(text);
  writer.alloc(2);
  writer.view.setUint32(0, writer.length);
  writer.view.setUint16(4, 3);
  writer.promise = writer.write();
};

export const authentication = ({ reader, connection: { options, writer } }) => {
  switch (reader.getInt32()) {
    case 5:
      md5Password(reader, writer, options);
      return;
    case 10:
      saslHandshake(reader, writer, options);
      return;
    case 11:
      saslContinue(reader, writer, options);
      return;
    case 12:
      saslFinal(reader, writer, options);
      return;
    case 0:
      return;
  }
  throw new Error('Not supported authentication method');
};
