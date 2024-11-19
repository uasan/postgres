export async function* AsyncIterator() {
  yield 1;
  yield 2;
  yield 3;

  return 5;
}

const asyncIterator = {
  [Symbol.asyncIterator]() {
    return {
      async next() {
        return {
          value: 'value',
          done: false,
        };
      },

      async return() {
        console.log('RETURN');
        return {
          done: true,
        };
      },

      async throw(error) {
        console.log('THROW', error);
        return {
          done: true,
        };
      },
    };
  },
};

async function test() {
  for await (const value of asyncIterator) {
    console.log(value);
    //break;
    throw new Error('ERROR');
  }
}

test().catch(() => {});
