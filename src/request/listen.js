import { PostgresError } from '../response/error.js';
import { stringify } from '../utils/string.js';

export async function listen(name, handler) {
  if (typeof handler !== 'function') {
    throw PostgresError.of('Listening handler must be function');
  }

  const handlers = this.listeners.get(name);

  if (handlers) {
    handlers.add(handler);
  } else {
    this.listeners.set(name, new Set().add(handler));
    await this.query(`LISTEN ${name}`);
  }
}

export async function notify(name, value) {
  await this.query('SELECT pg_catalog.pg_notify($1::text, $2::text)', [
    name,
    value === undefined ? undefined : stringify(value),
  ]);
}

export async function unlisten(name, handler) {
  if (typeof handler !== 'function') {
    throw PostgresError.of('Listening handler must be function');
  }

  const handlers = this.listeners.get(name);

  handlers?.delete(handler);

  if (!handlers?.size) {
    this.listeners.delete(name);
    await this.query(`UNLISTEN ${name}`);
  }
}

export async function restoreListeners() {
  await this.query('LISTEN ' + [...this.listeners.keys()].join(';LISTEN '));
}
