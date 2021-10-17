import { createConnection } from 'net';
import { handshake } from '../request/init.js';
import { randomTimeout } from '#native';
import { restoreListeners } from '../request/listen.js';

const retryErrors = new Set(['ECONNREFUSED', 'ECONNRESET', 'EPIPE']);
export class Connection {
  timeout = 0;
  promiseReadyForQuery = null;

  constructor(client) {
    this.client = client;
    const { path, host, port } = client.options;

    this.params = {
      path,
      host,
      port,
      //highWaterMark: 65535,
      onread: {
        callback: client.reader.read,
        buffer: client.reader.getBuffer,
      },
    };
  }

  onConnect = () => {
    if (this.client.stream === null) return;
    //console.log('ON-CONNECT');

    this.timeout = 0;
    this.client.options.signal?.addEventListener('abort', this.client.end);
    handshake(this.client);
  };

  onEnd = () => {
    //console.log('ONEND');
    this.client.clear();
  };

  onClose = () => {
    //console.log('ONCLOSE');
    const { client } = this;

    this.promiseReadyForQuery = null;
    this.client.options.signal?.removeEventListener('abort', client.end);

    if (!client.isEnded && client.isKeepAlive()) this.reconnect();
  };

  onError = error => {
    const client = this.client;
    client.isReady = false;

    if (client.task) {
      client.task.reject(error);
      client.task = null;
    }

    if (retryErrors.has(error.code)) {
      if (this.timeout > 60_000) {
        this.timeout = 0;
        console.error(error);
        client.cancelBatch(error);
      }
    } else {
      if (client.writer.reject) client.writer.reject(error);
      else console.error(error);
      client.end();
    }
  };

  resolve = resolvePromise => {
    //console.log('CONNECT-RESOLVE');
    const { client } = this;

    this.promiseReadyForQuery = null;

    client.isReady = true;

    if (client.listeners.size) restoreListeners.call(client);

    client.onReadyForQuery = client.constructor.prototype.onReadyForQuery;
    client.task = client.queue.dequeue();

    client.writer.unlock();
    client.task?.send(client);

    resolvePromise();
  };

  reject = (error, rejectPromise) => {
    this.client.isReady = false;
    this.client.isEnded = true;

    rejectPromise(error);
  };

  connect() {
    if (this.client.stream) return this.promiseReadyForQuery;
    //console.log('CONNECT');

    this.client.isEnded = false;
    this.client.stream = createConnection(this.params, this.onConnect)
      .on('error', this.onError)
      .once('end', this.onEnd)
      .once('close', this.onClose)
      .setNoDelay(true)
      .setKeepAlive(true, 60_000)
      .setTimeout(120_000, this.onTimeout);

    if (this.client.task && this.client.task !== this.promiseReadyForQuery) {
      this.client.queue.unshift(this.client.task);
    }

    let resolveTask;
    let rejectTask;

    this.promiseReadyForQuery = new Promise((resolve, reject) => {
      resolveTask = () => this.resolve(resolve);
      rejectTask = error => this.reject(error, reject);
    });

    this.promiseReadyForQuery.reject = rejectTask;

    this.client.task = this.promiseReadyForQuery;
    this.client.onReadyForQuery = resolveTask;

    return this.promiseReadyForQuery;
  }

  onTimeout = () => {
    if (this.client.listeners.size === 0) this.client.end();
  };

  async reconnect() {
    const token = {};
    this.tokenReconnect = token;
    this.timeout += await randomTimeout;

    if (token === this.tokenReconnect && this.client.stream === null) {
      console.log('RETRY');
      this.connect();
    }
  }
}
