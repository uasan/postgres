async function* IReadable() {
  try {
    for (let i = 1; i < 10; i++) yield i;
  } catch (error) {
    console.log('READABLE-CATCH');
    throw error;
  } finally {
    console.log('READABLE-FINALLY');
  }
}

const readable = IReadable();

async function* IWritable(readable) {
  for await (const chunk of readable) {
    try {
      yield 'A' + chunk;
    } catch (error) {
      console.log('WRITABLE-CATCH');
      await readable.throw(error);
    } finally {
      console.log('WRITABLE-FINALLY');
    }
  }
}

const writable = IWritable(readable);

async function test() {
  try {
    for await (const chunk of writable) {
      console.log(chunk);

      await writable.throw(new Error('FOR'));
    }
  } catch (error) {
    console.log('FOR-AWAIT-CATCH');
  } finally {
    console.log('FOR-AWAIT-FINALLY');
  }
}

test();
