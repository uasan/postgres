import { md5Password } from '../auth/md5.js';
import { saslHandshake, saslContinue, saslFinal } from '../auth/sasl.js';

export const handshake = ({
  writer,
  options: { username, database, params },
}) => {
  const keys = Object.keys(params);
  let text = 'user\x00' + username + '\x00database\x00' + database;

  text += '\x00timezone\x00UTC';
  text += '\x00client_encoding\x00UTF8';

  for (let i = 0; i < keys.length; i++)
    text += '\x00' + keys[i] + '\x00' + params[keys[i]];

  writer.alloc(8);
  writer.text(text);
  writer.alloc(2);
  writer.view.setUint32(0, writer.length);
  writer.view.setUint16(4, 3);
  writer.promise = writer.write();
};

export const authentication = ({ reader, writer, options }) => {
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

  switch (name.toLowerCase()) {
    case 'server_version':
      if (+value < 14)
        client.end(new Error(`Minimum supported version PostgreSQL 14`));
      break;

    case 'timezone':
      if (value !== 'UTC')
        client.end(new Error(`Only time zone UTC supported`));
      break;

    case 'client_encoding':
      if (value !== 'UTF8')
        client.end(new Error(`Only client encoding UTF8 supported`));
      break;
  }
};

export const negotiateProtocolVersion = () => {};
