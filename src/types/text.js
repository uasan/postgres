export const decodeTextUTF8 = reader => reader.getTextUTF8();
export const decodeTextASCII = reader => reader.getTextASCII();

export const encodeTextUTF8 = (writer, value) => {
  writer.setUTF8(value);
};

export { encodeTextUTF8 as encodeTextASCII };

export const text = {
  id: 25,

  decode: decodeTextUTF8,
  encode: encodeTextUTF8,

  decodeText: decodeTextUTF8,
  encodeText: encodeTextUTF8,

  decodeBlob: decodeTextUTF8,
  encodeBlob: encodeTextUTF8,
};

export const tsquery = {
  id: 3615,

  decode: decodeTextUTF8,
  encode: encodeTextUTF8,

  decodeText: decodeTextUTF8,
  encodeText: encodeTextUTF8,

  decodeBlob: null,
  encodeBlob: null,
};

export const tsvector = {
  id: 3614,

  decode: decodeTextUTF8,
  encode: encodeTextUTF8,

  decodeText: decodeTextUTF8,
  encodeText: encodeTextUTF8,

  decodeBlob: null,
  encodeBlob: null,
};

export const xml = { ...text, id: 142 };
export const char = { ...text, id: 18 };
export const name = { ...text, id: 19 };
export const varchar = { ...text, id: 1043 };
export const aclitem = { ...text, id: 1033 };
export const pgNodeTree = { ...text, id: 194 };
