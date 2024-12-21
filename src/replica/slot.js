import { quoteString } from '../utils/string.js';

export class Slot {
  client = null;
  name = '';

  constructor(client) {
    this.client = client;
  }

  async start(names) {
    this.name = this.client.options.sysPrefix + Date.now().toString(36);

    const { consistent_point } = await this.client
      .prepare()
      .setDataAsObject()
      .execute(
        `CREATE_REPLICATION_SLOT "${this.name}" TEMPORARY LOGICAL pgoutput (SNAPSHOT 'nothing')`
      );

    await this.client.query(
      `START_REPLICATION SLOT "${this.name}" LOGICAL ${consistent_point} (
        binary 'on',
        messages 'on',
        proto_version '1',
        publication_names ${names.map(quoteString).join(',')}
      )`
    );
  }
}
