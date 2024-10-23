export async function notificationResponse({ reader, listeners }) {
  let { ending } = reader;

  reader.offset += 4;
  let i = reader.uint8.indexOf(0, reader.offset) + 1;

  reader.ending = i - 1;
  const handlers = listeners.get(reader.getTextUTF8());

  if (handlers) {
    reader.offset = i;
    reader.ending = ending;

    const payload = reader.uint8[i] ? reader.getString() : undefined;

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
