export const { stringify, parse: parseJSON } = JSON;

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder('utf-8');

export const quoteString = value => "'" + value.replaceAll("'", "''") + "'";
