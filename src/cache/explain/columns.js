export function setColumns(context) {
  for (let name of context.outputs) {
    let { table } = context;
    const pos = name.indexOf('.');

    if (pos !== -1) {
      table = context.aliases.get(name.slice(0, pos));

      if (table) {
        name = name.slice(pos + 1);
      } else continue;
    }

    if (table.columns.has(name)) {
      context.tables.get(table).columns.add(table.columns.get(name));
    } else if (name === '*') {
      context.tables.get(table).columns.add(table.columns.values());
    }
  }
}
