import { authentication, backendKeyData } from '../request/init.js';
import { errorResponse, noticeResponse } from '../response/error.js';
import { notificationResponse } from '../response/notify.js';
import {
  noData,
  dataRow,
  bindComplete,
  readyForQuery,
  parseComplete,
  rowDescription,
  commandComplete,
  emptyQueryResponse,
  parameterDescription,
} from '../response/statement.js';
import {
  copyData,
  copyDone,
  copyInResponse,
  copyOutResponse,
  copyBothResponse,
} from '../response/copy.js';

const parameterStatus = ({ reader }) => {
    const [name, value] = reader.getTextUTF8().split('\x00');

    if (name === 'server_version' && +value < 14) {
      throw new Error(`Minimum supported version PostgreSQL 14`);
    }
  },
  closeComplete = () => {},
  portalSuspended = () => {},
  negotiateProtocolVersion = () => {};

export const handlers = {
  49: parseComplete,
  50: bindComplete,
  51: closeComplete,
  65: notificationResponse,
  67: commandComplete,
  68: dataRow,
  69: errorResponse,
  71: copyInResponse,
  72: copyOutResponse,
  73: emptyQueryResponse,
  75: backendKeyData,
  78: noticeResponse,
  82: authentication,
  83: parameterStatus,
  84: rowDescription,
  87: copyBothResponse,
  90: readyForQuery,
  99: copyDone,
  100: copyData,
  110: noData,
  115: portalSuspended,
  116: parameterDescription,
  118: negotiateProtocolVersion,
};
