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
  const { uint8 } = reader;

  let code = 0;
  const error = { pid, [isPostgresError]: true };

  while ((code = uint8[reader.offset])) {
    reader.ending = uint8.indexOf(0, ++reader.offset);

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
    message,
    position,
    [isPostgresError]: isPostgres,
    ...fields
  }) {
    super(message);

    if (isPostgres && sql && position) {
      let max = 60;

      let left = sql
        .slice(0, position - 1)
        .replace(/\s+/g, ' ')
        .trimStart();

      let right = sql
        .slice(position - 1)
        .replace(/\s+/g, ' ')
        .trimEnd();

      if (left.length > max) {
        const chunk = left.slice(0, left.length - max);
        left = left.slice(chunk.lastIndexOf(' ') + 1);
      }

      if (right.length > max) {
        const chunk = right.slice(max);
        right = right.slice(0, max + chunk.indexOf(' '));
      }

      let length = right.indexOf(' ') > 0 ? right.indexOf(' ') : right.length;

      this.stack =
        left + right + '\n' + ' '.repeat(left.length) + '^'.repeat(length);
    }
    //this.stack = sql;
    Object.assign(this, fields);
  }

  static is(error) {
    return error ? !!error[isPostgresError] || error instanceof this : false;
  }

  static of(message) {
    return new this({ message });
  }

  static transactionAborted({ pid }) {
    return new this({
      pid,
      code: '25P02',
      severity: 'ERROR',
      message: 'Current transaction is aborted',
    });
  }
}

export function errorResponse({ pid, task, reader }) {
  const error = makeError(pid, reader);

  if (task) {
    if (task.sql) {
      error.sql ??= task.sql;
    }
    task.onError(error);
    task.reject(error);
  } else {
    console.error(new PostgresError(error));
  }
}

export function noticeResponse({ pid, reader, options: { onMessage } }) {
  onMessage(makeError(pid, reader));
}
