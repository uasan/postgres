import { getRandomString, quoteString } from '../utils/string.js';
export class Slot {
  lsn = '';
  name = '';

  client = null;
  publications = null;

  constructor(client) {
    this.client = client;
  }

  async create() {
    this.name ||= getRandomString(this.client.options.ns);

    const { consistent_point } = await this.client
      .prepare()
      .setDataAsObject()
      .execute(
        `CREATE_REPLICATION_SLOT "${this.name}" TEMPORARY LOGICAL pgoutput (SNAPSHOT 'nothing')`
      );

    if (!this.lsn) {
      this.lsn = consistent_point;
      this.client.lsn.setFromString(this.lsn);
    }
  }

  async start() {
    await this.client.prepare().execute(
      `START_REPLICATION SLOT "${this.name}" LOGICAL ${this.lsn} (
        binary 'on',
        messages 'on',
        proto_version '1',
        publication_names ${this.publications.map(quoteString).join(',')}
      )`
    );
  }

  async reconnect() {
    if (this.client.lsn.bigint) {
      this.lsn = this.client.lsn.toString();
    }

    console.log('RECONNECT', this.name, this.lsn);

    try {
      await this.create();
      await this.start();
    } catch (error) {
      console.error(error);
    }
  }

  restart = () => {
    this.start().catch(console.error);
  };
}
