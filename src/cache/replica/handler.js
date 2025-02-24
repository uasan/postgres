import { CacheTable } from '../nodes/table.js';

export const handler = {
  onBegin() {
    //console.log('BEGIN:', state);
  },

  onTable({ xid }, table) {
    table.cache ??= new CacheTable(table, xid);
  },

  onInsert({ xid }, { cache, keys }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }

    for (let i = 0; i < keys.length; i++) {
      //console.log('ON_INSERT', cache.name, keys[i].name, keys[i].newValue);
      keys[i].cache.get(keys[i].newValue)?.invalidate();
    }
  },

  onUpdate({ xid }, { cache, keys }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }

    for (let i = 0; i < keys.length; i++) {
      //console.log('ON_UPDATE', cache.name, keys[i].name, keys[i].newValue);

      if (keys[i].oldValue !== undefined) {
        keys[i].cache.get(keys[i].oldValue)?.invalidate();
      }
      keys[i].cache.get(keys[i].newValue)?.invalidate();
    }
  },

  onDelete({ xid }, { cache, keys }) {
    if (cache.version !== xid) {
      cache.invalidate(xid);
    }

    for (let i = 0; i < keys.length; i++) {
      //console.log('ON_DELETE', cache.name, keys[i].name, keys[i].newValue);
      keys[i].cache.get(keys[i].oldValue)?.invalidate();
    }
  },

  onTruncate({ xid }, { cache }) {
    cache.invalidate(xid);
  },

  onMessage() {
    //
  },

  onCommit() {
    //console.log('COMMIT:', state, '\n');
  },
};
