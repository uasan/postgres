import { DEFAULT_PARAMS } from '../constants.js';

export const getConnectionOptions = ({
  port = 5432,
  host = '127.0.0.1',
  path = '',
  params,
  signal,
  database = 'postgres',
  username = 'postgres',
  password = '',
  onMessage = console.warn,
  maxConnections = 1,
} = {}) => ({
  port,
  host,
  path,
  signal,
  database,
  username,
  password,
  onMessage,
  maxConnections,
  params: {
    ...DEFAULT_PARAMS,
    ...params,
  },
});
