import { noop } from '#native';
import {
  formatError,
  STATUS_CODES,
  highlightErrorSQL,
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
    where,
    detail,
    message,
    severity,
    position,
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
      message += '\n' + detail.trim();
    }

    if (where) {
      message += '\n' + where.trim();
    }

    if (hint) {
      message += '\n' + hint.trim();
    }

    if (sql) {
      if (position >= 0) {
        message += '\n' + highlightErrorSQL(sql, position);
      } else {
        this.sql = sql.trim().replace(/\s+/g, ' ').slice(0, 320);
      }
    }

    formatError(Object.assign(this, fields), message);
  }

  static is(error) {
    return error ? !!error[isPostgresError] || error instanceof this : false;
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

const taskErrors = {
  42601: 'onErrorParse',
};

export function errorResponse({ pid, task, reader, connection }) {
  const error = makeError(pid, reader);

  if (error.severity === 'FATAL') {
    connection.error = error;
  } else if (error.code in taskErrors) {
    task[taskErrors[error.code]]();
  }

  if (task) {
    if (task.sql) {
      error.sql ??= task.sql;
    }
    task.onError(error);
    task.reject(error);
  } else {
    connection.disconnect(error).catch(noop);
  }
}

export function noticeResponse({ pid, reader, options: { onMessage } }) {
  onMessage(makeError(pid, reader));
}
