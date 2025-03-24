import { CacheTag } from './tag.js';

export class CacheColumn extends Map {
  name = '';
  table = null;

  constructor(table, { name }) {
    super();
    this.name = name;
    this.table = table;
  }

  getFullName() {
    return this.table.name + '.' + this.name;
  }

  addTag(key, node) {
    if (this.has(key)) {
      const tag = this.get(key);

      if (tag.has(node) === false) {
        node.tags.push(tag.add(node));
      }
    } else {
      const tag = new CacheTag(this, key);

      this.set(key, tag);
      node.tags.push(tag.add(node));
    }
    //console.log('ADD TAG', this.table.name, this.name, key);
  }
}
