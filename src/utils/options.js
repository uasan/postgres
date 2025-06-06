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

export function setOptionsToReplicaClient(options) {
  options = normalizeOptions(options);
  options.parameters.idle_session_timeout = '10min';

  return options;
}
