import { nullArray } from '#native';
import { sliceMatchSQL, stringToIndex } from './parser.js';
import { TagArray, TagVariable } from './tags.js';

function matchValue(meta, sql) {
  if (sql[0] === '$') {
    TagVariable.add(meta, parseInt(sql.slice(1)));
    return true;
  }
  if (sql[0] === "'") {
    tagByString(meta, sql);
    return true;
  }
  if (isNaN(parseFloat(sql)) === false) {
    tagByNumber(meta, sql);
    return true;
  }

  return false;
}

function matchArray(meta, values) {
  let isMatch = false;

  for (let i = 0; i < values.length; i++) {
    if (matchValue(meta, values[i])) {
      isMatch = true;
    }
  }

  return isMatch;
}

function tagByString(meta, sql) {
  tagByValue(meta, meta.context.strings.get(parseInt(sql.slice(1))));
}

function tagByNumber(meta, sql) {
  const index = sql.search(/[^-0-9.]/);
  tagByValue(meta, index === -1 ? sql : sql.slice(0, index));
}

function tagByValue(meta, value) {
  const key =
    meta.column.cache.getFullName() + ' = ' + meta.column.type.getSQL(value);

  if (meta.conditions.has(key) === false) {
    meta.conditions.set(key, {
      cache: meta.column.cache,
      value: meta.column.type.deserialize(value),
    });
  }
}

export function addCondition(context, sql) {
  sql = sql.slice(1, -1);

  if (sql.includes("'")) {
    sql = stringToIndex(context, sql);
  }

  context.conditions.add(sql);
}

function matchCondition(meta, sql) {
  if (sql.startsWith('= ')) {
    sql = sql.slice(2);
  } else {
    return false;
  }

  if (sql[0] === '$') {
    TagVariable.add(meta, parseInt(sql.slice(1)));
    return true;
  }
  if (sql[0] === "'") {
    tagByString(meta, sql);
    return true;
  }
  if (isNaN(parseFloat(sql)) === false) {
    tagByNumber(meta, sql);
    return true;
  }
  if (sql.startsWith('ANY ($')) {
    TagArray.add(meta, parseInt(sql.slice(6)));
    return true;
  }
  if (sql.startsWith('ANY (ARRAY[')) {
    return matchArray(meta, sql.slice(11, -2).split(', '));
  }
  if (sql.startsWith("ANY ('")) {
    return matchArray(
      meta,
      meta.context.strings
        .get(parseInt(sql.slice(6)))
        .slice(1, -1)
        .split(',')
    );
  }

  return false;
}

export function setConditions(context) {
  const { query } = context;

  for (const meta of context.tables.values()) {
    keys: for (let i = 0; i < meta.table.keys.length; i++) {
      meta.column = meta.table.keys[i];

      for (let i = 0; i < meta.aliases.length; i++) {
        let isMatch = false;
        let name = meta.aliases[i] + '.' + meta.column.name;

        for (let sql of context.conditions) {
          while ((sql = sliceMatchSQL(sql, name))) {
            if (matchCondition(meta, sql)) {
              isMatch = true;
            }
          }
        }

        if (isMatch === false) {
          meta.conditions.clear();
          break keys;
        }
      }
    }

    if (meta.conditions.size) {
      console.log(meta.conditions.keys());

      for (const tag of meta.conditions.values()) {
        if (tag.constructor === Object) {
          if (query.tags === nullArray) {
            query.tags = [];
          }
          tag.cache.addTag(tag.value, query);
        } else {
          if (query.isTagged) {
            query.resultTags.push(tag);
          } else {
            query.resultTags = [tag];
            query.isTagged = true;
          }
        }
      }
    } else {
      if (query.tags === nullArray) {
        query.tags = [];
      }
      query.tags.push(meta.table.cache.add(query));
    }
  }
}
