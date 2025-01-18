import { Message } from './message.js';

function setTupleData(reader, cols, key) {
  reader.offset += 3;

  for (let i = 0; i < cols.length; i++) {
    switch (reader.bytes[reader.offset++]) {
      case 98:
      case 116:
        reader.ending = reader.offset + reader.view.getInt32(reader.offset) + 4;
        reader.offset += 4;
        cols[i][key] = cols[i].type.decode(reader);
        reader.offset = reader.ending;
        break;

      case 110:
        cols[i][key] = null;
        break;

      case 117:
        cols[i][key] = undefined;
        break;
    }
  }
}

export class WAL {
  types = null;
  origin = null;
  handler = null;
  relations = null;

  state = {
    xid: 0,
    lsn: 0n,
  };

  init({ origin }) {
    this.origin = origin;
    this.types = origin.types;
    this.relations = origin.relations;
  }

  onBegin(reader) {
    this.state.xid = reader.view.getUint32(reader.offset + 16);

    try {
      this.handler.onBegin(this.state);
    } catch (error) {
      console.error(error);
    }
  }

  onTable(reader) {
    const table = this.origin.setRelation(
      reader.getUint32(),
      reader.getString() || 'pg_catalog',
      reader.getString()
    );

    reader.offset += 1;

    table.keys.length = 0;
    table.cols.length = reader.getUint16();

    for (let i = 0; i < table.cols.length; i++) {
      const isKey = reader.getUint8() === 1;
      const column = table.getColumn(reader.getString());

      column.position = i;
      column.isKey = isKey;
      column.type = this.types.getType(reader.getUint32());

      if (isKey) {
        table.keys.push(column);
      }

      table.cols[i] = column;
      reader.offset += 4;
    }

    try {
      this.handler.onTable(this.state, table);
    } catch (error) {
      console.error(error);
    }
  }

  onType() {
    //console.log('Type');
  }

  onInsert(reader) {
    const table = this.relations.get(reader.getUint32());
    setTupleData(reader, table.cols, 'newValue');

    try {
      this.handler.onInsert(this.state, table);
    } catch (error) {
      console.error(error);
    }
  }

  onUpdate(reader) {
    const table = this.relations.get(reader.getUint32());

    switch (reader.bytes[reader.offset]) {
      case 75:
      case 79:
        setTupleData(reader, table.cols, 'oldValue');
        break;

      default:
        for (let i = 0; i < table.cols.length; i++) {
          table.cols.oldValue = undefined;
        }
    }

    setTupleData(reader, table.cols, 'newValue');

    try {
      this.handler.onUpdate(this.state, table);
    } catch (error) {
      console.error(error);
    }
  }

  onDelete(reader) {
    const table = this.relations.get(reader.getUint32());
    setTupleData(reader, table.cols, 'oldValue');

    try {
      this.handler.onDelete(this.state, table);
    } catch (error) {
      console.error(error);
    }
  }

  onTruncate(reader) {
    reader.offset += 5;
    const table = this.relations.get(reader.getUint32());

    try {
      this.handler.onTruncate(this.state, table);
    } catch (error) {
      console.error(error);
    }
  }

  onMessage(reader) {
    reader.offset += 9;

    try {
      this.handler.onMessage(this.state, new Message(reader));
    } catch (error) {
      console.error(error);
    }
  }

  onOrigin() {
    //console.log('Origin');
  }

  onCommit() {
    try {
      this.handler.onCommit(this.state);
    } catch (error) {
      console.error(error);
    }
  }
}
