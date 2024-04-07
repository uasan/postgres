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
  Instant.fromEpochMicroseconds(view.getBigInt64(offset) + 946684800000000n);

const decodeDate = ({ view, offset }) =>
  plainDate.add({ days: ~~(view.getInt32(offset) / 86400) });

const decodeTime = ({ view, offset }) =>
  plainTime.add({ microseconds: Number(view.getBigInt64(offset)) });

const decodeInterval = ({ view, offset }) /* eslint-disable */ =>
  new Duration(0, view.getInt32(offset + 12), 0, view.getInt32(offset + 8), 0, 0, 0, 0, Number(view.getBigInt64(offset)));

function encodeTime (writer, value) {
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

function encodeDate  (writer, value) {
  const { view, length } = writer;

  writer.alloc(8);
  view.setInt32(length, 4);
  view.setInt32(length + 4, value.since(plainDate).days * 86400);
}

function encodeTimestamp  (writer, value) {
  const { view, length } = writer;

  writer.alloc(12);
  view.setInt32(length, 8);
  view.setBigInt64(length + 4, (value.epochMicroseconds ?? Instant.from(value).epochMicroseconds) - 946684800000000n);
}

function encodeInterval(writer, value) {
  const { view, length } = writer;

  writer.alloc(20);
  view.setInt32(length, 16);

  view.setBigInt64(
    length + 4,
    BigInt(
      value.hours * 3600000000 +
        value.minutes * 60000000 +
        value.seconds * 1000000 +
        value.milliseconds * 1000 +
        value.microseconds
    )
  );
  view.setInt32(length + 12, value.weeks * 7 + value.days);
  view.setInt32(length + 16, value.years * 12 + value.months);
};

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
