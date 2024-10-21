import { md5Password } from '../protocol/auth/md5.js';
import {
  saslFinal,
  saslContinue,
  saslHandshake,
} from '../protocol/auth/sasl.js';
import { PostgresError } from '../response/error.js';

export function handshake({ writer, options: { username, database, params } }) {
  const keys = Object.keys(params);
  let text = 'user\x00' + username + '\x00database\x00' + database;

  text += '\x00timezone\x00UTC';
  text += '\x00client_encoding\x00UTF8';

  for (let i = 0; i < keys.length; i++)
    text += '\x00' + keys[i] + '\x00' + params[keys[i]];

  writer.alloc(8);
  writer.uint8[6] = 0;
  writer.text(text);
  writer.alloc(2);
  writer.uint8[writer.length - 2] = 0;
  writer.uint8[writer.length - 1] = 0;
  writer.view.setUint32(0, writer.length);
  writer.view.setUint16(4, 3);

  writer.promise = writer.write();
}

export function authentication({ reader, writer, options }) {
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
}

export function backendKeyData(client) {
  client.pid = client.reader.getInt32();
  client.secret = client.reader.getInt32();
}

export function parameterStatus(client) {
  const [name, value] = client.reader.getTextUTF8().split('\x00');

  switch (name.toLowerCase()) {
    case 'server_version':
      if (+value < 14)
        client.abort(
          PostgresError.of(`Minimum supported version PostgreSQL 14`)
        );
      break;

    case 'timezone':
      if (value !== 'UTC')
        client.abort(PostgresError.of(`Only time zone UTC supported`), true);
      break;

    case 'client_encoding':
      if (value !== 'UTF8')
        client.abort(PostgresError.of(`Only client encoding UTF8 supported`));
      break;
  }
}

export function negotiateProtocolVersion() {}
