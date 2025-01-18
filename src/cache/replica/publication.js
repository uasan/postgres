import { CacheTable } from '../nodes/table.js';
import { getColsName, selectTableMeta } from './queries.js';

export async function setTablesPublications(context) {
  const pubs = [];
  const drops = [];
  const { origin, unTables } = context;

  const rows = await origin.cache.replica.query(
    selectTableMeta(origin, unTables)
  );

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

      if (row.isOrdinary === false) {
        //
      } else if (row.isLogged === false) {
        //
      } else if (row.isPubColumns === false && table.keys.length) {
        table.cache ??= new CacheTable(row.xid);

        if (row.isPubTable) {
          drops.push(table.getName());
        }
        pubs.push(
          table.getName() + '(' + table.keys.map(getColsName).join(',') + ')'
        );
      }
    }
  }

  if (pubs.length) {
    let sql = '';
    let name = origin.cache.publication;

    if (rows.some(row => row.isPub)) {
      if (drops.length) {
        sql = `ALTER PUBLICATION "${name}" DROP TABLE ${drops.join(',')};`;
      }
      sql += `ALTER PUBLICATION "${name}" ADD TABLE ${pubs.join(',')}`;
    } else {
      sql = `CREATE PUBLICATION "${name}" FOR TABLE ${pubs.join(',')}`;
    }

    try {
      await origin.cache.replica.query(sql, true);
    } catch (error) {
      if (error.code === '23505' || error.code === '42710') {
        await setTablesPublications(context);
      } else {
        origin.cache.replica.executeNextTask();
        throw error;
      }
    }
  }

  origin.cache.replica.executeNextTask();
}
