import { types } from '../protocol/types.js';

import {
  floor,
  Number,
  BigInt,
  Instant,
  Duration,
  PlainTime,
  PlainDate,
} from '#native';
import { stringify } from '../utils/string.js';

const plainTime = PlainTime.from('00:00');
const plainDate = PlainDate.from('2000-01-01');

const decodeTimestamp = ({ view, offset }) =>
  new Date(Number((view.getBigInt64(offset) + 946684800000000n) / 1000n));
//Instant.fromEpochMicroseconds(view.getBigInt64(offset) + 946684800000000n);

const decodeDate = ({ view, offset }) =>
  new Date(view.getInt32(offset) * 86400000 + 946684800000);
// plainDate.add({ days: floor(view.getInt32(offset) / 86400) });

const decodeTime = ({ view, offset }) =>
  plainTime.add({ microseconds: Number(view.getBigInt64(offset)) });

const decodeInterval = ({ view, offset }) =>
  new Duration(
    0,
    view.getInt32(offset + 12),
    0,
    view.getInt32(offset + 8),
    0,
    0,
    0,
    0,
    Number(view.getBigInt64(offset))
  );

function encodeTime(writer, value) {
  const { view, length } = writer;

  writer.alloc(12);
  view.setInt32(length, 8);

  view.setBigInt64(
    length + 4,
    BigInt(
      value.hour * 3600000000 +
        value.minute * 60000000 +
        value.second * 1000000 +
        value.millisecond * 1000 +
        value.microsecond
    )
  );
}

function encodeDate(writer, value) {
  writer.view.setInt32(writer.alloc(4), 4);
  writer.view.setInt32(writer.alloc(4), getInt32Date(value));
}

function getInt32Date(data) {
  switch (data.constructor) {
    case PlainDate:
      return data.since(plainDate).days * 86400;

    case Date:
      return floor((data.getTime() - 946684800000) / 86400000);

    case String:
      return floor((Date.parse(data) - 946684800000) / 86400000);

    case Number:
      return floor((data - 946684800000) / 86400000);

    default:
      throw stringify(data);
  }
}

function getBigIntTimestamp(data) {
  switch (data.constructor) {
    case Instant:
      return data.epochMicroseconds - 946684800000000n;

    case Date:
      return BigInt((data.getTime() - 946684800000) * 1000);

    case String:
      return BigInt((Date.parse(data) - 946684800000) * 1000);

    case Number:
      return BigInt((data - 946684800000) * 1000);

    default:
      throw stringify(data);
  }
}

function encodeTimestamp(writer, data) {
  writer.view.setInt32(writer.alloc(4), 8);
  writer.view.setBigInt64(writer.alloc(8), getBigIntTimestamp(data));
}

function encodeInterval(writer, value) {
  const { view, length } = writer;
  const data = typeof value === 'string' ? Duration.from(value) : value;

  writer.alloc(20);
  view.setInt32(length, 16);

  view.setBigInt64(
    length + 4,
    BigInt(
      data.hours * 3600000000 +
        data.minutes * 60000000 +
        data.seconds * 1000000 +
        data.milliseconds * 1000 +
        data.microseconds
    )
  );
  view.setInt32(length + 12, data.weeks * 7 + data.days);
  view.setInt32(length + 16, data.years * 12 + data.months);
}

function serializeDate(data) {
  switch (data.constructor) {
    case String:
      return data;

    case Instant:
      return data.toString();

    case Date:
      return data.toISOString();

    case Number:
      return new Date(data).toISOString();

    default:
      throw null;
  }
}

types
  .add({
    id: 1082,
    array: 1182,
    name: 'date',
    decode: decodeDate,
    encode: encodeDate,
    serialize: serializeDate,
  })
  .add({
    id: 1083,
    array: 1183,
    name: 'time',
    decode: decodeTime,
    encode: encodeTime,
  })
  .add({
    id: 1266,
    array: 1270,
    name: 'timetz',
    decode: decodeTime,
    encode: encodeTime,
  })
  .add({
    id: 1186,
    array: 1187,
    name: 'interval',
    decode: decodeInterval,
    encode: encodeInterval,
  })
  .add({
    id: 1114,
    array: 1115,
    name: 'timestamp',
    decode: decodeTimestamp,
    encode: encodeTimestamp,
    serialize: serializeDate,
  })
  .add({
    id: 1184,
    array: 1185,
    name: 'timestamptz',
    decode: decodeTimestamp,
    encode: encodeTimestamp,
    serialize: serializeDate,
  });
