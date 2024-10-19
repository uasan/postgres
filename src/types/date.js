import {
  Number,
  BigInt,
  Instant,
  Duration,
  PlainTime,
  PlainDate,
} from '#native';

const plainTime = PlainTime.from('00:00');
const plainDate = PlainDate.from('2000-01-01');

const decodeTimestamp = ({ view, offset }) =>
  new Date(Number((view.getBigInt64(offset) + 946684800000000n) / 1000n));
//Instant.fromEpochMicroseconds(view.getBigInt64(offset) + 946684800000000n);

const decodeDate = ({ view, offset }) =>
  plainDate.add({ days: ~~(view.getInt32(offset) / 86400) });

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
  const { view, length } = writer;

  writer.alloc(8);
  view.setInt32(length, 4);
  view.setInt32(length + 4, value.since(plainDate).days * 86400);
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
      throw new Error('Invalid timestamp value: ' + data);
  }
}

function encodeTimestamp(writer, data) {
  const { view, length } = writer;

  writer.alloc(12);
  view.setInt32(length, 8);
  view.setBigInt64(length + 4, getBigIntTimestamp(data));
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

export const date = {
  id: 1082,
  decode: decodeDate,
  encode: encodeDate,
};

export const time = {
  id: 1083,
  decode: decodeTime,
  encode: encodeTime,
};

export const timetz = {
  id: 1266,
  decode: decodeTime,
  encode: encodeTime,
};

export const interval = {
  id: 1186,
  decode: decodeInterval,
  encode: encodeInterval,
};

export const timestamp = {
  id: 1114,
  decode: decodeTimestamp,
  encode: encodeTimestamp,
};

export const timestamptz = {
  id: 1184,
  decode: decodeTimestamp,
  encode: encodeTimestamp,
};
