export interface PostgresClient {
  query(string: string, values?: any[], mode?: number): Promise<any>;
}


