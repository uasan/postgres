export async function notificationResponse({ reader, listeners }) {
  reader.offset += 4;
  const action = listeners.get(reader.getString());

  if (action) {
    try {
      await action(
        reader.bytes[reader.offset] ? JSON.parse(reader.getString()) : undefined
      );
    } catch (error) {
      console.error(error);
    }
  }
}
