export async function transaction(action) {
  this.isIsolated = true;

  try {
    await this.query('BEGIN');
    const result = await action(this);
    await this.query('COMMIT');
    return result;
  } catch (error) {
    await this.query('ROLLBACK');
    throw error;
  } finally {
    this.isIsolated = false;
  }
}
