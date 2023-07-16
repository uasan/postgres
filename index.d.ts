export interface PostgresClient {
  query(string: string, values?: any[], mode?: number): Promise<any>;
}

export interface SQL {
  log(): this;

  asObject(): this;
  asValue(): this;
  asBlob(): this;
}
