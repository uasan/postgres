import { MESSAGE_PASSWORD } from '../messages.js';
import { PostgresError } from '../../response/error.js';
import {
  xor,
  hmac,
  sha256,
  pbkdf2Sync,
  randomBytesBase64,
} from '../../utils/hash.js';

const authMap = new WeakMap();

export function saslHandshake(client) {
  const mechanisms = client.reader.getTextUTF8().split('\x00');

  if (mechanisms.includes('SCRAM-SHA-256') === false) {
    throw new PostgresError.of(
      'Not supported SASL auth-mechanisms: ' + mechanisms
    );
  }

  const nonce = randomBytesBase64(18);
  const message = 'n,,n=*,r=' + nonce;

  client.writer
    .type(MESSAGE_PASSWORD)
    .string('SCRAM-SHA-256')
    .setInt32(message.length)
    .text(message)
    .end();

  authMap.set(client.stream, {
    nonce,
    serverSignature: '',
    password: client.options.password,
  });
}

function makeParams(params, text) {
  params[text[0]] = text.slice(2);
  return params;
}

export function saslContinue({ reader, writer, stream }) {
  const auth = authMap.get(stream);
  const { r, s, i } = reader.getTextUTF8().split(',').reduce(makeParams, {});

  const saltedPassword = pbkdf2Sync(
    auth.password,
    Buffer.from(s, 'base64'),
    +i,
    32,
    'sha256'
  );

  const clientKey = hmac(saltedPassword, 'Client Key');
  const message = `n=*,r=${auth.nonce},r=${r},s=${s},i=${i},c=biws,r=${r}`;

  auth.serverSignature = hmac(
    hmac(saltedPassword, 'Server Key'),
    message
  ).toString('base64');

  const hashPassword = xor(
    clientKey,
    hmac(sha256(clientKey), message)
  ).toString('base64');

  writer.type(MESSAGE_PASSWORD).text(`c=biws,r=${r},p=${hashPassword}`).end();
}

export function saslFinal({ reader, stream }) {
  const { serverSignature } = authMap.get(stream);

  authMap.delete(stream);

  if (reader.getTextUTF8().split('\x00', 1)[0].slice(2) !== serverSignature) {
    throw PostgresError.of('The server did not return the correct signature');
  }
}
