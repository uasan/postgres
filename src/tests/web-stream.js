let transformController = null;

async function test() {
  const readable = new ReadableStream({
    type: 'bytes',
    start(controller) {
      controller.enqueue(new Uint8Array([1]));
      controller.enqueue(new Uint8Array([2]));
      controller.enqueue(new Uint8Array([3]));
    },
  });

  const transform = new TransformStream(
    {
      start(ctr) {
        transformController = ctr;
      },

      transform(chunk) {
        if (chunk[0] === 2) {
          transformController.error(new Error('This Error'));
        } else {
          transformController.enqueue(chunk);
        }
      },

      flush() {
        transformController.terminate();
      },
    },
    new CountQueuingStrategy({ highWaterMark: 1024 }),
    new CountQueuingStrategy({ highWaterMark: 1024 })
  );

  for await (const chunk of readable.pipeThrough(transform)) {
    console.log(chunk);
  }
}

test().catch(console.error);
