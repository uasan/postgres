export async function notificationResponse({ reader, listeners }) {
  reader.offset += 4;

  const handlers = listeners.get(reader.getString());

  if (handlers) {
    const payload = reader.bytes[reader.offset]
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
