import { now } from '#native';
import { MESSAGE_COPY_DATA } from '../protocol/messages.js';

function setData({ wal, reader }) {
  if (reader.bytes[reader.offset] === 119) {
    reader.offset += 25;

    switch (reader.bytes[reader.offset++]) {
      case 66:
        wal.onBegin(reader);
        break;

      case 82:
        wal.onRelation(reader);
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

      case 67:
        wal.onCommit(reader);
        break;

      case 84:
        wal.onTruncate(reader);
        break;

      case 89:
        wal.onType(reader);
        break;

      case 77:
        wal.onMessage(reader);
        break;

      case 79:
        wal.onOrigin(reader);
        break;
    }
  } else if (reader.bytes[reader.ending - 1]) {
    wal.lsn = reader.view.getBigUint64(reader.offset + 1);
    standbyStatusUpdate(reader.client);
    console.log('PONG', wal.lsn);
  }
}

function standbyStatusUpdate(client) {
  client.writer
    .type(MESSAGE_COPY_DATA)
    .setUint8(114)
    .setBigUint64(client.wal.lsn)
    .setBigUint64(client.wal.lsn)
    .setBigUint64(client.wal.lsn)
    .setBigInt64(now())
    .setUint8(0)
    .end();
}

export function copyBothResponse(client) {
  client.task.setData = setData;
  client.task.resolve();
}
