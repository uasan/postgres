import { nullArray } from '#native';

export class CacheResult {
  hit = 0;
  key = '';

  cache = null;
  data = null;
  tags = nullArray;

  constructor(cache, meta, data) {
    this.data = data;
    this.cache = cache;
    this.key = meta.key;

    if (cache.isTagged) {
      this.tags = [];

      for (let i = 0; cache.resultTags.length > i; i++) {
        cache.resultTags[i].set(meta.task, this);
      }
    }
  }

  purge() {
    this.cache.delete(this.key);

    for (let i = 0; this.tags.length > i; i++) {
      this.tags[i].unset(this);
    }

    //console.log('INVALIDATE', tag.column.table.name, tag.column.name, tag.key);
  }
}
