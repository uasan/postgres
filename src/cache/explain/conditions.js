export function addCondition(context, sql) {
  if (sql.includes(' = ')) {
    context.conditions.add(sql.slice(1, -1));
  }
}

function setByIndex({ values }, result) {
  this.column.addTag(values[this.index], result);
}

function setByArray(task, result) {
  const array = task.values[this.index];

  for (let i = 0; i < array.length; i++) {
    this.column.addTag(array[i], result);
  }
}

function setConditionVariable(context, { table, column }, index) {
  if (isNaN(index)) {
    return;
  }

  const tag = {
    column,
    index,
    set: setByIndex,
  };
  context.addTag(table, tag);
  //console.log('CONDITION', table.name + '.' + column.name + ' = $' + index);
}

function setConditionArray(context, { table, column }, index) {
  if (isNaN(index)) {
    return;
  }

  const tag = {
    column,
    index,
    set: setByArray,
  };
  context.addTag(table, tag);
  // console.log(
  //   'CONDITION',
  //   table.name + '.' + column.name + ' = ANY ($' + index + ')'
  // );
}

function sliceMatchSQL(sql, meta) {
  if (sql.startsWith(meta.pattern)) {
    return sql.slice(meta.pattern.length);
  } else if (sql.startsWith(meta.patternType)) {
    return sql.slice(sql.indexOf(' ') + 1);
  }

  return '';
}

export function setConditions(context) {
  const keys = [];

  for (const [alias, table] of context.aliases) {
    for (let i = 0; i < table.keys.length; i++) {
      const name = alias + '.' + table.keys[i].name;

      keys.push({
        table,
        column: table.keys[i].cache,
        pattern: name + ' ',
        patternType: '(' + name + ')::',
      });
    }
  }

  for (let sql of context.conditions) {
    for (let i = 0; i < keys.length; i++) {
      const txt = sliceMatchSQL(sql, keys[i]);

      if (txt) {
        if (txt.startsWith('= $')) {
          setConditionVariable(
            context,
            keys[i],
            parseInt(txt.slice(3), 10) - 1
          );
        } else if (txt.startsWith('= ANY ($')) {
          setConditionArray(context, keys[i], parseInt(txt.slice(8), 10) - 1);
        }
        break;
      }
    }
  }
}
