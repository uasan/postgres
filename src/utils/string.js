export const { fromCharCode } = String;
export const { stringify, parse: parseJSON } = JSON;

export const textEncoder = new TextEncoder('utf-8');
export const textDecoder = new TextDecoder('utf-8');

const { utf8Slice } = Buffer.prototype;

export const decodeUTF8 = (uint8, offset, length) => {
  //return fromCharCode(...uint8.subarray(offset, length));
  return utf8Slice.call(uint8.subarray(offset, length));
};
