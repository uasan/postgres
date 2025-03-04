export class TagVariable {
  index = 0;
  column = null;

  set(task, result) {
    this.column.addTag(task.values[this.index], result);
  }

  static add(context, meta, index) {
    const tag = new this();

    tag.index = index - 1;
    tag.column = meta.column;

    context.addTag(meta.table, tag);
  }
}

export class TagArray extends TagVariable {
  set(task, result) {
    const array = task.values[this.index];

    for (let i = 0; i < array.length; i++) {
      this.column.addTag(array[i], result);
    }
  }
}
