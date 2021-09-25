export const { stringify, parse: parseJSON } = JSON;

export const { asciiSlice, utf8Slice } = Buffer.prototype;

export const encodeTextInto = TextEncoder.prototype.encodeInto.bind(
  new TextEncoder()
);
