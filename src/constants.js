export const //
  FETCH_ALL = 2,
  FETCH_ONE = 4,
  FETCH_ONE_VALUE = 8,
  TYPE_BLOB = 16,
  TYPE_NATIVE = 32;

export const DEFAULT_PARAMS = {
  // lc_time: 'C',
  // lc_numeric: 'C',
  // lc_messages: 'C',
  // lc_monetary: 'C',
  // compute_query_id: 'on',
  timezone: 0,
  datestyle:  'iso',
  intervalstyle: 'iso_8601',
  client_encoding: 'utf-8',
  client_min_messages: 'WARNING',
  lock_timeout: 0,
  statement_timeout: 0,
  idle_in_transaction_session_timeout: 0,
};
