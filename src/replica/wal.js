import { nullArray } from '#native';

function getTupleData(reader, { cols }) {
  reader.offset += 3;
  const values = new Array(cols.length);

  for (let i = 0; i < cols.length; i++) {
    switch (reader.bytes[reader.offset++]) {
      case 98:
      case 116:
        reader.ending = reader.offset + reader.view.getInt32(reader.offset) + 4;
        reader.offset += 4;
        values[i] = cols[i].type.decode(reader);
        reader.offset = reader.ending;
        break;

      case 110:
        values[i] = null;
        break;

      case 117:
        values[i] = undefined;
        break;
    }
  }

  return values;
}

export class WAL {
  lsn = 0n;
  time = 0n;

  types = null;
  origin = null;
  handler = null;
  relations = null;

  constructor({ origin }, handler) {
    this.handler = handler;

    this.origin = origin;
    this.types = origin.types;
    this.relations = origin.relations;
  }

  onBegin() {}

  onRelation(reader) {
    const table = this.origin.setRelation(
      reader.getUint32(),
      reader.getString() || 'pg_catalog',
      reader.getString()
    );

    reader.offset += 1;

    for (let i = 0, length = reader.getUint16(); i < length; i++) {
      const isKey = reader.getUint8() === 1;
      const column = table.getColumn(reader.getString());

      column.position = i;
      column.type = this.types.getType(reader.getUint32());

      if (isKey) {
        column.isKey = true;
        table.keys.push(column);
      }

      table.cols.push(column);
      reader.offset += 4;
    }
  }

  onType() {
    //console.log('Type');
  }

  onInsert(reader) {
    const table = this.relations.get(reader.getUint32());

    try {
      this.handler.onInsert?.(table, getTupleData(reader, table));
    } catch (error) {
      console.error(error);
    }
  }

  onUpdate(reader) {
    const table = this.relations.get(reader.getUint32());

    let oldValues = nullArray;

    switch (reader.bytes[reader.offset]) {
      case 75:
      case 79:
        oldValues = getTupleData(reader, table);
        break;
    }

    try {
      this.handler.onUpdate?.(table, getTupleData(reader, table), oldValues);
    } catch (error) {
      console.error(error);
    }
  }

  onDelete(reader) {
    const table = this.relations.get(reader.getUint32());

    try {
      this.handler.onDelete?.(table, getTupleData(reader, table));
    } catch (error) {
      console.error(error);
    }
  }

  onTruncate(reader) {
    reader.offset += 5;

    try {
      this.handler.onTruncate?.(this.relations.get(reader.getUint32()));
    } catch (error) {
      console.error(error);
    }
  }

  onMessage(reader) {
    reader.offset += 9;

    const prefix = reader.getString();
    reader.ending = reader.getUint32() + reader.offset;

    try {
      this.handler.onMessage?.(prefix, reader.getTextUTF8());
    } catch (error) {
      console.error(error);
    }
  }

  onOrigin() {
    //console.log('Origin');
  }

  onCommit() {
    // reader.offset += 9;
    // this.lsn = reader.getBigUint64();
  }
}
