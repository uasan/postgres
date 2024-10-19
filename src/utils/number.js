import { isNaN, parseInt } from './native.js';

export function ensureNetNum(n) {
  if (n < 0 || n > 255) throw null;
  return n;
}

export function parseInt16(string) {
  const n = parseInt(string, 16);

  if (isNaN(n)) throw null;
  return n;
}
