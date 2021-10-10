import { noop } from '#native';
import { TRANSACTION_ACTIVE, TRANSACTION_INACTIVE } from '../constants.js';

export async function transaction(action) {
  this.isIsolated = true;

  try {
    await this.query('BEGIN');
    const result = await action(this);

    if (this.state === TRANSACTION_ACTIVE) {
      await this.query('COMMIT');
    }

    return result;
  } catch (error) {
    if (this.state !== TRANSACTION_INACTIVE) {
      await this.query('ROLLBACK').catch(noop);
    }
    throw error;
  } finally {
    this.isIsolated = false;
  }
}
