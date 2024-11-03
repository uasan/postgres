export const //
  TRANSACTION_ERROR = 69,
  TRANSACTION_ACTIVE = 84,
  TRANSACTION_INACTIVE = 73;

export const BUFFER_LENGTH = 131072;

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

export const ERRORS = {
  DATABASE_NOT_EXIST: '3D000',
  RELATION_NOT_EXIST: '42P01',
};
