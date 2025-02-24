import { nullArray } from '#native';

export function addCondition(context, sql) {
  if (sql.includes(' = ')) {
    context.conditions.add(sql.slice(1, -1));
  }
}

function setByIndex({ values }, result) {
  result.tags.push(this.column.factory(values[this.index]).add(result));
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

  console.log('CONDITION', table.name, column.name, index);

  if (context.query.tags === nullArray) {
    context.query.tags = [tag];
  } else {
    context.query.tags.push(tag);
  }

  context.tables.get(table).add(tag);
}

export function setConditions(context) {
  const keys = [];

  for (const [alias, table] of context.aliases) {
    for (let i = 0; i < table.keys.length; i++) {
      keys.push({
        table,
        column: table.keys[i].cache,
        pattern: alias + '.' + table.keys[i].name + ' ',
      });
    }
  }

  for (let sql of context.conditions) {
    for (let i = 0; i < keys.length; i++)
      if (sql.startsWith(keys[i].pattern)) {
        const txt = sql.slice(keys[i].pattern.length);

        if (txt.startsWith('= $')) {
          setConditionVariable(
            context,
            keys[i],
            parseInt(txt.slice(3), 10) - 1
          );
        } else {
          //console.log(sql);
        }
        break;
      }
  }
}
