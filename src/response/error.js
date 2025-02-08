import {
  formatError,
  STATUS_CODES,
  highlightErrorSQL,
  shortSQL,
} from '../utils/error.js';

//https://www.postgresql.org/docs/current/protocol-error-fields.html
//https://www.postgresql.org/docs/current/errcodes-appendix.html

const isPostgresError = Symbol('isPostgresError');

const fields = {
  67: 'code',
  68: 'detail',
  72: 'hint',
  77: 'message',
  80: 'position',
  86: 'severity',
  87: 'where',
  99: 'column',
  100: 'datatype',
  110: 'constraint',
  112: 'internalPosition',
  113: 'query',
  115: 'schema',
  116: 'table',
};

function makeError(pid, reader) {
  const { bytes } = reader;

  let code = 0;
  const error = { pid, [isPostgresError]: true };

  while ((code = bytes[reader.offset])) {
    reader.ending = bytes.indexOf(0, ++reader.offset);

    if (fields[code]) {
      error[fields[code]] = reader.getTextUTF8();
    }

    reader.offset = reader.ending + 1;
  }

  return error;
}

export class PostgresError extends Error {
  constructor({
    sql,
    hint,
    query,
    where,
    detail,
    message,
    severity,
    position,
    internalPosition,
    [isPostgresError]: isPostgres,
    ...fields
  }) {
    super(message);

    if (isPostgres && severity) {
      fields.status ??= STATUS_CODES[fields.code] ?? 500;

      if (severity !== 'ERROR') {
        this.severity = severity;
      }
    }

    if (detail) {
      if (fields.constraint) {
        fields.detail = detail;
      } else {
        message += '\n' + detail.trim();
      }
    }

    if (where) {
      message += '\n' + where.trim();
    }

    if (hint) {
      message += '\n' + hint.trim();
    }

    if (query) {
      if (internalPosition) {
        message += '\n' + highlightErrorSQL(query, internalPosition);
      } else {
        message += '\nSQL: ' + shortSQL(query);
      }
    } else if (sql) {
      sql = String(sql);

      if (position) {
        message += '\n' + highlightErrorSQL(sql, position);
      } else {
        message += '\nSQL: ' + shortSQL(sql);
      }
    }

    formatError(Object.assign(this, fields), message);
  }

  static is(error) {
    return error ? !!error[isPostgresError] || error instanceof this : false;
  }

  static isFatal(error) {
    return error.severity === 'FATAL' && error.code !== '57P03';
  }

  static of(message) {
    return new this({ message });
  }

  static abortTransaction({ pid }) {
    return new this({
      pid,
      code: '25P02',
      message: 'Current transaction is aborted',
    });
  }

  static poolOverflow() {
    return new this({
      status: 429,
      message: 'Connections are out',
    });
  }
}

export function errorResponse({ pid, task, reader, connection }) {
  const error = makeError(pid, reader);

  if (PostgresError.isFatal(error)) {
    connection.error = error;
  }

  if (task) {
    if (task.sql) {
      error.sql ??= task.sql;
    }
    task.error(error);
  } else {
    connection.disconnect(error);
    console.error(new PostgresError(error));
  }
}

export function noticeResponse({ pid, reader, options: { onMessage } }) {
  onMessage(makeError(pid, reader));
}
