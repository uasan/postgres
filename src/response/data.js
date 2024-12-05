import { create } from '#native';
import { PostgresError } from './error.js';

export function initArray() {
  this.data = [];
}

export function initObject() {
  this.data = {};
}

export function initObjectNull() {
  this.data = create(null);
}

export function getData() {
  return this.data;
}

export function pushDataObject() {
  const data = {};
  this.data.push(data);
  return data;
}

export function pushDataArray() {
  const data = [];
  this.data.push(data);
  return data;
}

export function setDataFields(reader) {
  const row = this.addData();
  const { columns, decoders } = this.statement;

  for (let i = 0; i < columns.length; i++) {
    row[columns[i]] = reader.decode(decoders[i]);
  }
}

export function setDataEntries(reader) {
  const row = this.addData();
  const { decoders } = this.statement;

  for (let i = 0; i < decoders.length; i++) {
    row.push(reader.decode(decoders[i]));
  }
}

export function setDataValue(reader) {
  this.data = reader.decode(this.statement.decoders[0]);
}

export function setValueToArray(reader) {
  this.data.push(reader.decode(this.statement.decoders[0]));
}

export function setDataLookup(reader) {
  const { columns, decoders } = this.statement;

  if (this.count >= columns.length) {
    throw PostgresError.of('Lookup depth should be less length columns');
  }

  let row = this.data;
  const deep = this.count - 1;

  for (let i = 0; i < deep; i++) {
    row = row[reader.decode(decoders[i])] ??= create(null);
  }

  const key = reader.decode(decoders[deep]);

  if (deep + 2 === columns.length) {
    row[key] = reader.decode(decoders[deep + 1]);
  } else {
    row = row[key] ??= {};

    for (let i = deep + 1; i < columns.length; i++) {
      row[columns[i]] = reader.decode(decoders[i]);
    }
  }
}
