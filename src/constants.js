export const //
  FETCH_ALL = 2,
  FETCH_ONE = 4,
  FETCH_ONE_VALUE = 8,
  TYPE_BLOB = 16,
  TYPE_NATIVE = 32,
  TRANSACTION_ERROR = 69,
  TRANSACTION_ACTIVE = 84,
  TRANSACTION_INACTIVE = 73;

export const DEFAULT_PARAMS = {
  // compute_query_id: 'on',
  // client_connection_check_interval: 10000,
  datestyle: 'iso',
  lock_timeout: 0,
  statement_timeout: 0,
  intervalstyle: 'iso_8601',
  client_min_messages: 'WARNING',
  idle_in_transaction_session_timeout: 0,
};
