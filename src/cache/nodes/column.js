import { CacheTag } from './tag.js';

export class CacheColumn extends Map {
  name = '';
  table = null;

  constructor(table, { name }) {
    super();
    this.name = name;
    this.table = table;
  }

  addTag(key, result) {
    if (this.has(key)) {
      const tag = this.get(key);

      if (tag.has(result) === false) {
        result.tags.push(tag.add(result));
      }
    } else {
      const tag = new CacheTag(this, key);

      this.set(key, tag);
      result.tags.push(tag.add(result));
    }
    //console.log('ADD TAG', this.table.name, this.name, key);
  }
}
