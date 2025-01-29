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
//import { sendCopyDone } from './replica/copy.js';
import { LSN } from './replica/lsn.js';
import { PostgresClient } from './client.js';

export class PostgresReplication {
  pid = 0;
  secret = 0;
  transactions = 0;

  task = null;
  types = null;
  stream = null;
  origin = null;
  client = null;
  options = null;
  waitReady = null;

  isReady = true;
  isIsolated = true;
  isCopyMode = false;

  state = TRANSACTION_INACTIVE;

  queue = new Queue();
  reader = new Reader(this);
  writer = new Writer(this);
  connection = new Connection(this);

  lsn = new LSN(this);
  wal = new WAL(this);
  slot = new Slot(this);

  constructor(options) {
    this.options = normalizeOptions(options);
    this.origin = Origin.get(this.options);
    this.types = this.origin.types;

    this.client = new PostgresClient(options);

    this.options.timeout = 0;
    this.options.cache = null;
    this.options.parameters.replication = 'database';
    this.options.parameters.session_replication_role = 'replica';

    this.wal.init(this);
  }

  async subscribe(publications, handler) {
    this.wal.handler = handler;
    this.slot.publications = publications;

    await this.slot.create();
    await this.slot.start();
  }

  prepare() {
    return new Task(this);
  }

  async query(sql, isForced = false) {
    // if (this.isCopyMode) {
    //   await sendCopyDone(this);
    // }
    return isForced
      ? await new Task(this.client).asValue().forceExecute(sql)
      : await new Task(this.client).asValue().cork().execute(sql);
  }

  executeNextTask() {
    this.client.task?.uncork();
  }

  clear() {
    this.pid = 0;
    this.secret = 0;

    this.stream = null;
    this.isReady = true;
    this.isCopyMode = false;

    this.reader.clear();
    this.writer.clear();

    if (this.waitReady) {
      this.waitReady.reject();
      this.waitReady = null;
    }

    for (let task = this.queue.head; task; task = task.next) {
      task.isSent = false;
      task.statement = null;
    }
  }

  onReconnected() {
    if (this.slot.lsn) {
      this.slot.reconnect();
    }
  }

  isKeepAlive() {
    return true;
  }

  cancelTasks() {}

  abort(error) {
    if (error) {
      console.error(error);
    }
  }
}
