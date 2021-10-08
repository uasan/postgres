import { md5Password } from '../auth/md5.js';
import { saslHandshake, saslContinue, saslFinal } from '../auth/sasl.js';
import { TimeZone } from '#native';

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

export const backendKeyData = client => {
  client.pid = client.reader.getInt32();
  client.secret = client.reader.getInt32();
};

export const parameterStatus = client => {
  const [name, value] = client.reader.getTextUTF8().split('\x00');

  switch (name) {
    case 'server_version':
      if (+value < 14)
        throw new Error(`Minimum supported version PostgreSQL 14`);
      break;

    case 'TimeZone':
      client.timeZone = new TimeZone(value);
      break;
  }
};

export const negotiateProtocolVersion = () => {};
