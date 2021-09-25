import { createHash, randomBytes, createHmac } from 'crypto';
export { pbkdf2Sync } from 'crypto';

export const md5 = value => createHash('md5').update(value).digest('hex');

export const randomBytesBase64 = length =>
  randomBytes(length).toString('base64');

export const hmac = (key, data) =>
  createHmac('sha256', key).update(data).digest();

export const sha256 = data => createHash('sha256').update(data).digest();

export const xor = (a, b) => {
  const length = Math.max(a.length, b.length);
  const buffer = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) buffer[i] = a[i] ^ b[i];

  return buffer;
};
