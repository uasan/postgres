function completeSelect({ task }) {
  if (task.isData === false && task.errorNoData) {
    task.reject(task.errorNoData);
  } else {
    task.resolve(task.data);

    if (task.cache) {
      task.cache.save();
    }
  }
}

function completeReturning({ task }) {
  if (task.isData === false && task.errorNoData) {
    task.reject(task.errorNoData);
  } else {
    task.resolve(task.data);
  }
}

function completeCount({ task, reader }) {
  task.count = this.getCountRows(reader);

  if (task.count === 0 && task.errorNoData) {
    task.reject(task.errorNoData);
  } else {
    task.resolve(task.count);
  }
}

function completeResolve({ task }) {
  task.onReady = task.resolve;
}

function getCountFive(reader) {
  reader.offset += 5;
  reader.ending -= 1;
  return Number(reader.getAscii());
}

function getCountSix(reader) {
  reader.offset += 6;
  reader.ending -= 1;
  return Number(reader.getAscii());
}

function getCountSeven(reader) {
  reader.offset += 7;
  reader.ending -= 1;
  return Number(reader.getAscii());
}

function getCountNine(reader) {
  reader.offset += 9;
  reader.ending -= 1;
  return Number(reader.getAscii());
}

export function setComplete(client) {
  switch (
    client.reader.getAscii(
      client.reader.bytes.indexOf(32, client.reader.offset)
    )
  ) {
    case 'SELECT':
      this.complete = completeSelect;
      this.getCountRows = getCountSeven;
      break;

    case 'INSERT':
      this.getCountRows = getCountNine;
      this.complete = this.decoders.length ? completeReturning : completeCount;
      break;

    case 'UPDATE':
    case 'DELETE':
      this.getCountRows = getCountSeven;
      this.complete = this.decoders.length ? completeReturning : completeCount;
      break;

    case 'MERGE':
    case 'FETCH':
      this.complete = completeCount;
      this.getCountRows = getCountSix;
      break;

    case 'COPY':
    case 'MOVE':
      this.complete = completeCount;
      this.getCountRows = getCountFive;
      break;

    default:
      this.complete = completeResolve;
  }

  this.complete(client);
}

export function readCountRows({ reader }) {
  switch (reader.getAscii(reader.bytes.indexOf(32, reader.offset))) {
    case 'SELECT':
    case 'UPDATE':
    case 'DELETE':
      reader.offset += 7;
      break;

    case 'INSERT':
      reader.offset += 9;
      break;

    case 'MERGE':
    case 'FETCH':
      reader.offset += 6;
      break;

    case 'COPY':
    case 'MOVE':
      reader.offset += 5;
      break;

    default:
      return 0;
  }

  reader.ending -= 1;
  return Number(reader.getAscii());
}
