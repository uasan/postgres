import { Task } from './task.js';
import { Queue } from './utils/queue.js';
import { Reader } from './protocol/reader.js';
import { Writer } from './protocol/writer.js';
import { Connection } from './protocol/connection.js';
import { normalizeOptions } from './utils/options.js';
import { TRANSACTION_INACTIVE } from './constants.js';
import { Slot } from './replica/slot.js';
import { Origin } from './store/origin.js';
import { WAL } from './replica/wal.js';

export class PostgresReplication {
  pid = 0;
  secret = 0;
  transactions = 0;

  wal = null;
  task = null;
  types = null;
  stream = null;
  origin = null;
  options = null;
  waitReady = null;

  isReady = true;
  isIsolated = false;

  state = TRANSACTION_INACTIVE;

  listeners = new Map();

  slot = new Slot(this);
  queue = new Queue();
  reader = new Reader(this);
  writer = new Writer(this);
  connection = new Connection(this);

  constructor(options) {
    this.options = normalizeOptions(options);
    this.origin = Origin.get(options);
    this.types = this.origin.types;

    this.options.timeout = 0;
    this.options.parameters.replication = 'database';
    this.options.parameters.session_replication_role = 'replica';
  }

  async subscribe(names, handler) {
    this.wal = new WAL(this, handler);
    await this.slot.start(names);
  }

  prepare() {
    return new Task(this);
  }

  query(sql) {
    return new Task(this).execute(sql);
  }

  clear() {}

  cancelTasks() {}

  abort(error) {
    console.error(error);
  }
}
