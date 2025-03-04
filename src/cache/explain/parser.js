import { TagArray, TagVariable } from './tags.js';

function tagByValue(context, meta, value) {
  switch (value[0]) {
    case '$':
      TagVariable.add(context, meta, parseInt(value.slice(1), 10));
  }
}

function tagByValues(context, meta, values) {
  for (let i = 0; i < values.length; i++) {
    tagByValue(context, meta, values[i]);
  }
}

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

function sliceMatchSQL(sql, { name }) {
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

export function setConditions(context) {
  const metaKeys = [];

  for (const [alias, table] of context.aliases) {
    for (let i = 0; i < table.keys.length; i++) {
      metaKeys.push({
        table,
        column: table.keys[i].cache,
        name: alias + '.' + table.keys[i].name,
      });
    }
  }

  for (let sql of context.conditions) {
    for (let i = 0; i < metaKeys.length; i++) {
      let txt = '';

      while ((txt = sliceMatchSQL(sql, metaKeys[i]))) {
        if (txt.startsWith('= $')) {
          TagVariable.add(context, metaKeys[i], parseInt(txt.slice(3), 10));
          sql = txt.slice(txt.indexOf(' ', 4) + 1);
        } else if (txt.startsWith('= ANY ($')) {
          TagArray.add(context, metaKeys[i], parseInt(txt.slice(8), 10));
          sql = txt.slice(txt.indexOf(' ', 9) + 1);
        } else if (txt.startsWith('= ANY (ARRAY[')) {
          tagByValues(context, metaKeys[i], txt.slice(13, -2).split(', '));
          sql = txt.slice(txt.indexOf('])', 14) + 3);
        } else {
          break;
        }
      }
    }
  }
}

export function addCondition(context, sql) {
  if (sql.includes(' = ')) {
    context.conditions.add(sql.slice(1, -1));
  }
}
