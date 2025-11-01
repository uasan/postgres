import { noop } from '#native';
import { DEFAULT_PARAMS } from '../constants.js';

export function normalizeOptions({
  cache,
  signal,
  parameters,
  ns = '_',
  path = '',
  port = 5432,
  host = '127.0.0.1',
  database = 'postgres',
  username = 'postgres',
  password = '',
  onMessage = noop,
  maxConnections = 1,
} = {}) {
  return {
    ns,
    port,
    host,
    path,
    cache,
    signal,
    database,
    username,
    password,
    onMessage,
    maxConnections,
    parameters: {
      ...DEFAULT_PARAMS,
      ...parameters,
    },
  };
}

export function setOptionsToReplicaClient(options) {
  options = normalizeOptions(options);
  options.parameters.idle_session_timeout = '10min';

  return options;
}
