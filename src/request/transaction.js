import { noop } from '#native';

export async function transaction(action, payload) {
  this.isIsolated = true;

  try {
    await this.query('BEGIN');
    const result = await action(this, payload);
    await this.query('COMMIT');
    return result;
  } catch (error) {
    await this.query('ROLLBACK').catch(noop);
    throw error;
  } finally {
    this.isIsolated = false;
  }
}
