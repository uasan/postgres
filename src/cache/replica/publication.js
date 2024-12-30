import { selectTableMeta } from './queries.js';

export async function setTablesPublications({ origin, unTables }) {
  const rows = await origin.cache.replica.query(selectTableMeta(unTables));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const table = unTables[i];

    if (table.oid !== row.oid) {
      origin.relations.set(row.oid, table);

      table.oid = row.oid;
      table.keys.length = 0;
      table.cols.length = row.cols.length;

      for (let c = 0; c < row.cols.length; c++) {
        const column = table.getColumn(row.cols[c].name);

        column.position = c;
        column.isKey = row.cols[c].isKey;
        column.type = origin.types.getType(row.cols[c].type);

        table.cols[c] = column;

        if (column.isKey) {
          table.keys.push(column);
        }
      }

      console.log(row);
    }
  }
}
