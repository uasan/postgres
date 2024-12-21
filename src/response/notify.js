export async function notificationResponse({ reader, listeners }) {
  let { ending } = reader;

  reader.offset += 4;
  let i = reader.bytes.indexOf(0, reader.offset) + 1;

  reader.ending = i - 1;
  const handlers = listeners.get(reader.getTextUTF8());

  if (handlers) {
    reader.offset = i;
    reader.ending = ending;

    const payload = reader.bytes[i]
      ? JSON.parse(reader.getString())
      : undefined;

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
