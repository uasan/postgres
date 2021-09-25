export function putData() {
  return (this.data = {});
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
    const decode = decoders[i];

    length = reader.getInt32();

    if (length === -1) row[name] = null;
    else {
      reader.ending = ending = reader.offset + length;
      row[name] = decode(reader);
      reader.offset = ending;
    }
  }
}

export function setDataValue(reader) {
  reader.offset += 2;
  const length = reader.getInt32();

  if (length !== -1) {
    const decode = this.statement.decoders[0];
    reader.ending = reader.offset + length;
    this.data = decode(reader);
  }
}
