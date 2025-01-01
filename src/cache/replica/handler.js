export const handler = {
  onBegin(state) {
    console.log('BEGIN:', state);
  },

  onInsert({ xid }, { cache }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }
  },

  onUpdate({ xid }, { cache }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }
  },

  onDelete({ xid }, { cache, keys }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }

    for (let i = 0; i < keys.length; i++) {
      keys[i].cache?.get(keys[i].oldValue)?.invalidate(xid);
    }
  },

  onTruncate({ xid }, { cache }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }
  },

  onMessage() {
    //
  },

  onCommit(state) {
    console.log('COMMIT:', state, '\n');
  },
};
