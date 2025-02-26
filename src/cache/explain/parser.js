export function isSpecSymbol(char) {
  switch (char) {
    case ' ':
    case '(':
    case ')':
    case ',':
    case ':':
    case undefined:
      return true;

    default:
      return false;
  }
}
