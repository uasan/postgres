import { PostgresError } from '../response/error.js';
import { stringify } from './string.js';

export function listenSQL({ listeners, options }, name, action) {
  if (typeof action !== 'function') {
    throw PostgresError.of('Listening handler must be function');
  }

  listeners.set(name, action);

  return listeners.size === 1 && options.parameters.idle_session_timeout
    ? `LISTEN ${name}; SET idle_session_timeout = '0'`
    : `LISTEN ${name}`;
}

export const restoreListenSQL = ({ listeners }) =>
  'LISTEN ' +
  [...listeners.keys()].join(';LISTEN ') +
  "; SET idle_session_timeout = '0'";

export function unlistenSQL({ listeners, options }, name) {
  listeners.delete(name);

  return listeners.size === 0 && options.parameters.idle_session_timeout
    ? `LISTEN ${name}; SET idle_session_timeout = '${options.parameters.idle_session_timeout}'`
    : `LISTEN ${name}`;
}

export function notifySQL(client, name, value) {
  return client.query('SELECT pg_catalog.pg_notify($1::text, $2::text)', [
    name,
    value === undefined ? undefined : stringify(value),
  ]);
}
