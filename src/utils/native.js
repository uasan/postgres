import { Temporal } from 'temporal-polyfill';

export const //
  noop = () => {},
  identity = x => x,
  { isArray } = Array,
  { assign } = Object,
  { max, ceil, floor, round, random } = Math,
  { Number, String, BigInt } = globalThis,
  { isNaN, isFinite, parseInt, NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number,
  nullArray = Object.freeze([]),
  nullObject = Object.freeze(Object.create(null)),
  {
    Now,
    Instant,
    Duration,
    PlainDateTime,
    PlainDate,
    PlainTime,
    ZonedDateTime,
    TimeZone,
  } = Temporal;

export const randomTimeout = {
  then(resolve) {
    const delay = ceil(500 + random() * 5000);
    setTimeout(resolve, delay, delay);
  },
};

BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};
