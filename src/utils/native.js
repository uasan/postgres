import { Temporal } from '@js-temporal/polyfill';

export const //
  noop = () => {},
  { seal } = Object,
  { random, floor } = Math,
  { Number, String, BigInt } = globalThis,
  { isNaN, NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number,
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

export const setTimeout = delay => ({
  then(resolve) {
    globalThis.setTimeout(resolve, delay);
  },
});

export function then(resolve, reject) {
  this.resolve = resolve;
  this.reject = reject;
}

export const randomTimeout = {
  then(resolve) {
    const delay = 500 + random() * 5000;
    setTimeout(resolve, delay, delay);
  },
};
