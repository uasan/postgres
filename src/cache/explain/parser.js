function isSpecSymbol(char) {
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

export function sliceMatchSQL(sql, name) {
  const pos = sql.indexOf(name);
  const end = pos + name.length;
  const spc = sql.indexOf(' ', end);

  return pos !== -1 &&
    spc !== -1 &&
    isSpecSymbol(sql[pos - 1]) &&
    isSpecSymbol(sql[end])
    ? sql.slice(spc + 1)
    : '';
}

export function stringToIndex(context, sql) {
  let index = 0;
  let query = '';
  let isValue = false;

  const parts = sql.split("'");

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '' && ++i < parts.length) {
      context.strings.set(index, context.strings.get(index) + "'" + parts[i]);
    } else if (isValue) {
      isValue = false;
      query += "'" + ++index + "'";
      context.strings.set(index, parts[i]);
    } else {
      isValue = true;
      query += parts[i];
    }
  }

  return query;
}
