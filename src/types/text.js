import { noop } from '#native';
import { types } from '../protocol/types.js';

types
  .addType({
    id: 0,
    name: 'unknown',
  })
  .addType({
    id: 2278,
    name: 'void',
    decode: noop,
    encode: noop,
  })
  .addType({
    id: 25,
    array: 1009,
    name: 'text',
  })
  .addType({
    id: 142,
    array: 143,
    name: 'xml',
  })
  .addType({
    id: 18,
    array: 1002,
    name: 'char',
  })
  .addType({
    id: 19,
    array: 1003,
    name: 'name',
  })
  .addType({
    id: 1043,
    array: 1015,
    name: 'varchar',
  })
  .addType({
    id: 1042,
    array: 1014,
    name: 'bpchar',
  })
  .addType({
    id: 3734,
    array: 3735,
    name: 'regconfig',
  })
  .addType({
    id: 1033,
    array: 1034,
    name: 'aclitem',
  })
  .addType({
    id: 194,
    name: 'pg_node_tree',
  });
