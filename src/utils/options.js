import { noop } from '#native';
import { DEFAULT_PARAMS } from '../constants.js';

export const normalizeOptions = ({
  ns = '_',
  signal,
  cache,
  parameters,
  path = '',
  port = 5432,
  host = '127.0.0.1',
  timeout = 1_000_000,
  database = 'postgres',
  username = 'postgres',
  password = '',
  onMessage = noop,
  maxConnections = 1,
} = {}) => ({
  ns,
  port,
  host,
  path,
  cache,
  signal,
  timeout,
  database,
  username,
  password,
  onMessage,
  maxConnections,
  parameters: {
    ...DEFAULT_PARAMS,
    ...parameters,
  },
});
