export const decodeText = reader => reader.getTextUTF8();
export const encodeText = (writer, value) => {
  writer.setUTF8(String(value));
};

export const text = {
  id: 25,
  decode: decodeText,
  encode: encodeText,
};
export const tsquery = {
  id: 3615,
  decode: decodeText,
  encode: encodeText,
};
export const tsvector = {
  id: 3614,
  decode: decodeText,
  encode: encodeText,
};
export const xml = {
  id: 142,
  decode: decodeText,
  encode: encodeText,
};
export const char = {
  id: 18,
  decode: decodeText,
  encode: encodeText,
};
export const name = {
  id: 19,
  decode: decodeText,
  encode: encodeText,
};
export const varchar = {
  id: 1043,
  decode: decodeText,
  encode: encodeText,
};
export const bpchar = {
  id: 1042,
  decode: decodeText,
  encode: encodeText,
};
export const regconfig = {
  id: 3734,
  decode: decodeText,
  encode: encodeText,
};
export const aclitem = {
  id: 1033,
  decode: decodeText,
  encode: encodeText,
};
export const pgNodeTree = {
  id: 194,
  decode: decodeText,
  encode: encodeText,
};
export const unknown = {
  id: 0,
  decode: decodeText,
  encode: encodeText,
};
