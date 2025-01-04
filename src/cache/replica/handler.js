export const handler = {
  onBegin(state) {
    console.log('BEGIN:', state);
  },

  onInsert({ xid }, { cache, keys }) {
    cache?.invalidate(xid);

    for (let i = 0; i < keys.length; i++) {
      keys[i].cache?.invalidate(xid, keys[i].newValue);
    }
  },

  onUpdate({ xid }, { cache, keys }) {
    cache?.invalidate(xid);

    for (let i = 0; i < keys.length; i++) {
      if (keys[i].oldValue !== undefined) {
        keys[i].cache?.invalidate(xid, keys[i].oldValue);
      }
      keys[i].cache?.invalidate(xid, keys[i].newValue);
    }
  },

  onDelete({ xid }, { cache, keys }) {
    cache?.invalidate(xid);

    for (let i = 0; i < keys.length; i++) {
      keys[i].cache?.invalidate(xid, keys[i].oldValue);
    }
  },

  onTruncate({ xid }, { cache }) {
    cache?.invalidate(xid);
  },

  onMessage() {
    //
  },

  onCommit(state) {
    console.log('COMMIT:', state, '\n');
  },
};
