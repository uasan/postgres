export const { String } = globalThis;
export const { stringify, parse: parseJSON } = JSON;

export const textEncoder = new TextEncoder('utf-8');
export const textDecoder = new TextDecoder('utf-8');

const { utf8Slice } = Buffer.prototype;
textDecoder.decode = uint8 => utf8Slice.call(uint8);
