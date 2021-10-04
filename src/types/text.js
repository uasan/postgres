export const decodeText = reader => reader.getTextUTF8();
export const encodeText = (writer, value) => {
  writer.setUTF8(value);
};

export const text = {
  id: 25,
  decode: decodeText,
  encode: encodeText,

  decodeText,
  encodeText,
  decodeBlob: decodeText,
  encodeBlob: encodeText,
};

export const tsquery = {
  id: 3615,
  decode: decodeText,
  encode: encodeText,

  decodeText,
  encodeText,
  decodeBlob: null,
  encodeBlob: null,
};

export const tsvector = {
  id: 3614,
  decode: decodeText,
  encode: encodeText,

  decodeText,
  encodeText,
  decodeBlob: null,
  encodeBlob: null,
};

export const xml = { ...text, id: 142 };
export const char = { ...text, id: 18 };
export const name = { ...text, id: 19 };
export const varchar = { ...text, id: 1043 };
export const aclitem = { ...text, id: 1033 };
export const pgNodeTree = { ...text, id: 194 };
