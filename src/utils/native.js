export const //
  noop = () => {},
  { seal } = Object,
  nullArray = Object.freeze([]),
  nullObject = Object.freeze(Object.create(null));

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