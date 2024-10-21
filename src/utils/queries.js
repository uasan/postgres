export const setCommit = client =>
  client.transactions > 1
    ? `RELEASE SAVEPOINT _${--client.transactions}`
    : 'COMMIT';

export const setRollback = client =>
  client.transactions > 1
    ? `ROLLBACK TO SAVEPOINT _${--client.transactions}`
    : 'ROLLBACK';
