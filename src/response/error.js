//https://www.postgresql.org/docs/current/protocol-error-fields.html
const fields = {
  67: 'code',
  68: 'detail',
  72: 'hint',
  77: 'message',
  80: 'position',
  86: 'severity',
  87: 'where',
  99: 'column',
  100: 'datatype',
  110: 'constraint',
  113: 'query',
  115: 'schema',
  116: 'table',
};

const parseError = (pid, reader) => {
  let code = 0;
  const error = { pid };
  const { uint8 } = reader;

  while ((code = uint8[reader.offset])) {
    reader.ending = uint8.indexOf(0, ++reader.offset);
    if (fields[code]) error[fields[code]] = reader.getTextUTF8();
    reader.offset = reader.ending + 1;
  }

  return error;
};

export const errorResponse = ({ pid, task, reader }) => {
  const error = parseError(pid, reader);
  error.sql = task?.sql;
  if (task) task.reject(error);
  else console.error(Object.assign(new Error(error.message), error));
};

export const noticeResponse = ({ pid, reader, options: { onMessage } }) => {
  onMessage(parseError(pid, reader));
};
