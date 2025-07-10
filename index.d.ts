export interface PostgresClient {
  query(sql: string, values?: any[]): Promise<unknown>;
  isTransaction(): boolean;
}

export interface PostgresPool extends PostgresClient {

}
