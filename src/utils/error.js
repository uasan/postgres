//import { styleText } from 'node:util';
import { stringify } from './string.js';

// const red = text => styleText('red', text);
// const bold = text => styleText('bold', text);

const red = text => '\x1b[1m\x1b[31m' + text + '\x1b[0m\x1b[22m';

export const STATUS_CODES = {
  42501: 403,
  23505: 409,
  23001: 409,
  23503: 409,
  23000: 409,
  23514: 422,
  23502: 422,
  22007: 422,
  22008: 422,
  22003: 422,
  '22P02': 422,
  '22P03': 422,
};

export function makeErrorEncodeParameter(task, error, index) {
  const { sql } = task;
  const { name } = task.statement.encoders[index];

  let position = sql.indexOf('$' + (index + 1));
  let message = `Invalid value param $${index + 1}::${name}`;

  if (error) {
    message += ': ' + error.message || error;
  } else {
    message += ' = ' + stringify(task.values[index]);
  }

  return { sql, position, message, status: 422 };
}

export function highlightErrorSQL(sql, position) {
  const max = 60;

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

  const length = right.indexOf(' ') > 0 ? right.indexOf(' ') : right.length;

  return (
    left + right + '\n' + ' '.repeat(left.length) + red('^'.repeat(length))
  );
}

const DIR = import.meta.resolve('../../');
const filterStack = line => !line.includes(DIR) && line.includes('file://');

export const filterErrorStack = stack =>
  stack.split('\n').filter(filterStack).join('\n');

export function formatError(error, message) {
  error.stack =
    red('Postgres Error: ') + message + '\n' + filterErrorStack(error.stack);
}
