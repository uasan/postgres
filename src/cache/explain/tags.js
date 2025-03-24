export class TagVariable {
  index = 0;
  column = null;

  set(task, result) {
    this.column.addTag(task.values[this.index], result);
  }

  static getKey(meta, index) {
    return meta.column.cache.getFullName() + ' = $' + index;
  }

  static add(meta, index) {
    const key = this.getKey(meta, index);

    if (meta.conditions.has(key) === false) {
      const tag = new this();

      tag.index = index - 1;
      tag.column = meta.column.cache;
      meta.conditions.set(key, tag);
    }
  }
}

export class TagArray extends TagVariable {
  set(task, result) {
    const array = task.values[this.index];

    for (let i = 0; i < array.length; i++) {
      this.column.addTag(array[i], result);
    }
  }

  static getKey(meta, index) {
    return meta.column.cache.getFullName() + ' = ANY($' + index + ')';
  }
}
