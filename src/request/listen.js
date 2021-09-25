export async function listen(name, handler) {
  if (typeof handler !== 'function') {
    throw new Error('Listening handler must be function');
  }

  const handlers = this.listeners.get(name);

  if (handlers) {
    if (handlers.includes(handler) === false) {
      handlers.push(handler);
    }
  } else {
    await this.query(`LISTEN ${name}`);
    this.listeners.set(name, [handler]);
  }
}

export async function notify(name, value) {
  await this.query(`SELECT pg_catalog.pg_notify($1::text, $2::text)`, [
    name,
    value,
  ]);
}

export async function unlisten(name, handler) {
  if (typeof handler !== 'function') {
    throw new Error('Listening handler must be function');
  }

  const handlers = this.listeners.get(name);

  if (handlers?.includes(handler)) {
    handlers.splice(handlers.indexOf(handler), 1);
  }

  if (!handlers?.length) {
    this.listeners.delete(name);
    await this.query(`UNLISTEN ${name}`);
  }
}

export async function restoreListeners() {
  await this.query('LISTEN ' + [...this.listeners.keys()].join(';LISTEN '));
}
