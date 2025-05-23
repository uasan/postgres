import { styleText } from 'node:util';
import { stringify } from './string.js';

const red = text => styleText('bold', styleText('red', text));

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
  22023: 422,
  '22P02': 422,
  '22P03': 422,
};

export function makeErrorEncodeParameter(task, index) {
  const { sql } = task;
  const { name } = task.statement.encoders[index];

  const position = sql.indexOf('$' + (index + 1)) + 1;
  const message = `Invalid value param $${index + 1}::${name} = ${stringify(task.values[index])}`;

  return { status: 422, sql, position, message };
}

export const shortSQL = sql =>
  sql.replace(/\s+/g, ' ').trimStart().slice(0, 320);

export function highlightErrorSQL(sql, position) {
  const max = 80;

  let left = sql
    .slice(0, position - 1)
    .replace(/\s+/g, ' ')
    .trimStart();

  let right = sql
    .slice(position - 1)
    .replace(/\s+/g, ' ')
    .trimEnd();

  const length =
    right.indexOf(' ') > 0
      ? right.indexOf(' ')
      : right.indexOf(' ', 1) > 0
        ? right.indexOf(' ', 1)
        : right.length;

  if (left.length > max) {
    left = left.slice(-(length + max));
  }

  if (right.length > max) {
    right = right.slice(0, length + max);
  }

  return (
    left + right + '\n' + ' '.repeat(left.length + 5) + red('^'.repeat(length))
  );
}

const DIR = import.meta.resolve('../../');
const filterStack = line => !line.includes(DIR) && line.includes('file://');

export const filterErrorStack = stack =>
  stack.split('\n').filter(filterStack).join('\n') ||
  stack.slice(stack.indexOf('\n') + 1);

export function formatError(error, message) {
  error.stack =
    red('Postgres Error: ') + message + '\n' + filterErrorStack(error.stack);
}
