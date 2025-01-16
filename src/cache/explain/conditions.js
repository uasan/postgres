export function addCondition(context, sql) {
  if (sql.includes(' = ')) {
    context.conditions.add(sql.slice(1, -1));
  }
}

function setConditionVariable(context, { table, column }, index) {
  console.log(table.name, column.name, index);
}

export function setConditions(context) {
  const keys = [];

  for (const [alias, table] of context.aliases) {
    for (let i = 0; i < table.keys.length; i++) {
      keys.push({
        table,
        column: table.keys[i],
        pattern: alias + '.' + table.keys[i].name + ' ',
      });
    }
  }

  for (let sql of context.conditions) {
    for (let i = 0; i < keys.length; i++)
      if (sql.startsWith(keys[i].pattern)) {
        const txt = sql.slice(keys[i].pattern.length);

        if (txt.startsWith('= $')) {
          setConditionVariable(context, keys[i], parseInt(txt.slice(3), 10));
        } else console.log(sql);
        break;
      }
  }
}
