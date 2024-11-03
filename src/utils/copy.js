import { stringify } from './string.js';

const OPTIONS_FROM = {
  freeze: false,
  where: '',
};

export const getDescribeTable = (table, columns) =>
  `SELECT ${columns ? '"' + columns.join('", "') + '"' : '*'} FROM ${table}`;

export function makeCopyFromSQL(table, options = OPTIONS_FROM) {
  let sql = 'COPY ' + table;

  if (options.columns) {
    sql += '("' + options.columns.join('", "') + '")';
  }

  sql += ' FROM STDIN WITH (FORMAT binary';

  if (options.freeze) sql += ', FREEZE';

  sql += ')';

  if (options.where) {
    sql += ' WHERE ' + options.where;
  }

  return sql;
}

export function makeErrorCopyFrom({ columns, decoders }, index, error, data) {
  let message = 'Invalid value ' + columns[index] + '::' + decoders[index].name;

  if (error) {
    message += ' - ' + error.message || error;
  } else {
    message += ' = ' + stringify(data);
  }

  return message;
}
