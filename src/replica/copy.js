import { MESSAGE_COPY_DONE } from '../protocol/messages.js';

function setData({ lsn, wal, reader }) {
  if (reader.bytes[reader.offset] === 119) {
    lsn.setWAL(wal, reader.view.getBigUint64(reader.offset + 1));
    reader.offset += 25;

    switch (reader.bytes[reader.offset++]) {
      case 66:
        wal.onBegin(reader);
        break;

      case 82:
        wal.onTable(reader);
        break;

      case 73:
        wal.onInsert(reader);
        break;

      case 85:
        wal.onUpdate(reader);
        break;

      case 68:
        wal.onDelete(reader);
        break;

      case 89:
        wal.onType(reader);
        break;

      case 77:
        wal.onMessage(reader);
        break;

      case 84:
        wal.onTruncate(reader);
        break;

      case 79:
        wal.onOrigin(reader);
        break;

      case 67:
        wal.onCommit(reader);
        break;
    }
  } else if (reader.bytes[reader.ending - 1]) {
    lsn.send(reader.view.getBigUint64(reader.offset + 1));
  }
}

export function copyBothResponse(client) {
  client.writer.lock();

  client.isCopyMode = true;
  client.task.setData = setData;
  client.task.resolve();
}

export async function sendCopyDone(client) {
  client.isCopyMode = false;
  client.slot.lsn = client.lsn.toString();
  client.writer.type(MESSAGE_COPY_DONE).end().flush().unlock();

  await client.task;
  console.log('DONE', client.slot.lsn);

  client.waitReady = Promise.withResolvers();
  client.waitReady.promise.then(client.slot.restart);
}
