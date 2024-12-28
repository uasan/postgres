import { isNaN, parseInt } from './native.js';

export function ensureFinite(n) {
  if (isFinite(n)) return n;
  throw null;
}

export function ensureNetNum(n) {
  if (n < 0 || n > 255) throw null;
  return n;
}

export function parseInt16(string) {
  const n = parseInt(string, 16);

  if (isNaN(n)) throw null;
  return n;
}

export const slashLSN = text =>
  text.length > 8
    ? text.slice(0, text.length - 8) + '/' + text.slice(text.length - 8)
    : '0/' + text;
