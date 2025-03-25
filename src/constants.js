export const //
  TRANSACTION_ERROR = 69,
  TRANSACTION_ACTIVE = 84,
  TRANSACTION_INACTIVE = 73;

export const BUFFER_LENGTH = 131072;
export const BUFFER_MAX_LENGTH = 268435456;

export const DEFAULT_PARAMS = {
  datestyle: 'iso',
  intervalstyle: 'iso_8601',
  tcp_keepalives_count: '3',
  tcp_keepalives_idle: '5min',
  tcp_keepalives_interval: '1s',
  client_min_messages: 'WARNING',
};

export const ERRORS = {
  DATABASE_NOT_EXIST: '3D000',
  RELATION_NOT_EXIST: '42P01',
};
