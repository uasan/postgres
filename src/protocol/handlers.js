import { notificationResponse } from '../response/notify.js';
import { errorResponse, noticeResponse } from '../response/error.js';
import { copyInResponse, copyBothResponse } from '../request/copyFrom.js';
import { copyData, copyDone, copyOutResponse } from '../response/copyTo.js';
import {
  authentication,
  backendKeyData,
  parameterStatus,
  negotiateProtocolVersion,
} from '../request/init.js';
import {
  noData,
  dataRow,
  bindComplete,
  closeComplete,
  readyForQuery,
  parseComplete,
  rowDescription,
  commandComplete,
  portalSuspended,
  emptyQueryResponse,
  parameterDescription,
} from '../response/statement.js';

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
