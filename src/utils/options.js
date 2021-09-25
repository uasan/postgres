import { DEFAULT_PARAMS } from '../constants.js';

export const getConnectionOptions = ({
  port = 5432,
  host = '127.0.0.1',
  path = '',
  max = 10,
  params,
  signal,
  database = 'postgres',
  username = 'postgres',
  password = '',
  onMessage = console.warn,
} = {}) => ({
  port,
  host,
  path,
  max,
  signal,
  database,
  username,
  password,
  onMessage,
  params: {
    ...DEFAULT_PARAMS,
    ...params,
  },
});
