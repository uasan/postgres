import { CacheResult } from './result.js';

export class CacheColumn extends Map {
  name = '';
  table = null;

  constructor(table, { name }) {
    super();
    this.name = name;
    this.table = table;
  }

  factory(key) {
    if (this.has(key)) {
      return this.get(key);
    }

    const result = new CacheResult(this, key);
    this.set(key, result);

    console.log('FACTORY', this.table.name, this.name, key);

    return result;
  }
}
