import { noop } from '#native';
import { DEFAULT_PARAMS } from '../constants.js';

export const normalizeOptions = ({
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
  sysPrefix = '_',
  onMessage = noop,
  maxConnections = 1,
  isSaveStatements = true,
} = {}) => ({
  port,
  host,
  path,
  cache,
  signal,
  timeout,
  database,
  username,
  password,
  sysPrefix,
  onMessage,
  maxConnections,
  isSaveStatements,
  parameters: {
    ...DEFAULT_PARAMS,
    ...parameters,
  },
});
