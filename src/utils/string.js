export const { stringify, parse: parseJSON } = JSON;

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder('utf-8');

export const quoteString = value => "'" + value.replaceAll("'", "''") + "'";

export const getRandomString = prefix =>
  prefix + Math.round(Number.MAX_SAFE_INTEGER * Math.random()).toString(36);

let id = 0;
export const nextID = ({ ns }) => ns + (id++).toString(36);
