export const NULL = new Uint8Array([255, 255, 255, 255]);
export const INT16_ONE_ONE = new Uint8Array([0, 1, 0, 1]);
export const PREPARED_PORTAL = 80;
export const PREPARED_QUERY = 83;

export const MESSAGES_EXEC_SYNC_FLUSH = new Uint8Array([
  69, 0, 0, 0, 9, 0, 0, 0, 0, 0, 83, 0, 0, 0, 4, 72, 0, 0, 0, 4,
]);

export const //
  MESSAGE_SYNC = 83,
  MESSAGE_FLUSH = 72,
  MESSAGE_BIND = 66,
  MESSAGE_PARSE = 80,
  MESSAGE_DESCRIBE = 68,
  MESSAGE_PASSWORD = 112,
  MESSAGE_EXECUTE = 69,
  MESSAGE_QUERY = 81,
  MESSAGE_CLOSE = 67,
  MESSAGE_COPY_DATA = 100,
  MESSAGE_COPY_FAIL = 102,
  MESSAGE_COPY_DONE = new Uint8Array([
    99, 0, 0, 0, 4, 83, 0, 0, 0, 4, 72, 0, 0, 0, 4,
  ]),
  MESSAGE_TERMINATE = new Uint8Array([88, 0, 0, 0, 4]);
