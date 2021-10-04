import {
  xor,
  hmac,
  sha256,
  pbkdf2Sync,
  randomBytesBase64,
} from '../utils/hash.js';
import { MESSAGE_PASSWORD } from '../protocol/messages.js';

export const saslHandshake = (reader, writer, options) => {
  const mechanisms = reader.getTextUTF8().split('\x00');

  if (mechanisms.includes('SCRAM-SHA-256') === false)
    throw new Error('Not supported SASL auth-mechanisms: ' + mechanisms);

  options.nonce ??= randomBytesBase64(18);
  const message = 'n,,n=*,r=' + options.nonce;

  writer
    .type(MESSAGE_PASSWORD)
    .string('SCRAM-SHA-256')
    .setInt32(message.length)
    .text(message)
    .end();
};

const makeParams = (params, text) => {
  params[text[0]] = text.slice(2);
  return params;
};

export const saslContinue = (reader, writer, options) => {
  const { password, nonce } = options;
  const { r, s, i } = reader.getTextUTF8().split(',').reduce(makeParams, {});

  const saltedPassword = pbkdf2Sync(
    password,
    Buffer.from(s, 'base64'),
    +i,
    32,
    'sha256'
  );

  const clientKey = hmac(saltedPassword, 'Client Key');
  const message = `n=*,r=${nonce},r=${r},s=${s},i=${i},c=biws,r=${r}`;

  options.serverSignature = hmac(
    hmac(saltedPassword, 'Server Key'),
    message
  ).toString('base64');

  const hashPassword = xor(
    clientKey,
    hmac(sha256(clientKey), message)
  ).toString('base64');

  writer.type(MESSAGE_PASSWORD).text(`c=biws,r=${r},p=${hashPassword}`).end();
};

export const saslFinal = (reader, writer, { serverSignature }) => {
  if (reader.getTextUTF8().split('\x00', 1)[0].slice(2) !== serverSignature)
    throw new Error('The server did not return the correct signature');
};
