export function initArray() {
  this.data = [];
}

export function initObject() {
  this.data = {};
}

export function getData() {
  return this.data;
}

export function pushData() {
  const data = {};
  this.data.push(data);
  return data;
}

export function setDataFields(reader) {
  const row = this.addData();
  const { columns, decoders } = this.statement;

  let length = 0;
  let ending = 0;
  reader.offset += 2;

  for (let i = 0; i < columns.length; i++) {
    const name = columns[i];

    length = reader.getInt32();

    if (length === -1) row[name] = null;
    else {
      reader.ending = ending = reader.offset + length;
      row[name] = decoders[i].decode(reader);
      reader.offset = ending;
    }
  }
}

export function setDataValue(reader) {
  reader.offset += 2;
  const length = reader.getInt32();

  if (length === -1) {
    this.data = null;
  } else {
    reader.ending = reader.offset + length;
    this.data = this.statement.decoders[0].decode(reader);
  }
}

export function setValueToArray(reader) {
  reader.offset += 2;
  const length = reader.getInt32();

  if (length === -1) {
    this.data.push(null);
  } else {
    reader.ending = reader.offset + length;
    this.data.push(this.statement.decoders[0].decode(reader));
  }
}
