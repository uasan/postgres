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

  const length = writer.alloc(4);

  writer
    .setInt32(196608)
    .text(text)
    .setInt16(0)
    .view.setUint32(length, writer.length - length);

  writer.promise = writer.write();
}

export function authentication(client) {
  switch (client.reader.getInt32()) {
    case 5:
      md5Password(client);
      return;
    case 10:
      saslHandshake(client);
      return;
    case 11:
      saslContinue(client);
      return;
    case 12:
      saslFinal(client);
      return;
    case 0:
      return;
  }
  throw PostgresError.of('Not supported authentication method');
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

export function negotiateProtocolVersion({ reader, task }) {
  const version = reader.getInt16() + '.' + reader.getInt16();

  task?.reject(PostgresError.of('Negotiate Protocol Version ' + version));
}
