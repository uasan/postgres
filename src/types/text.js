import { noop } from '#native';
import { types } from '../protocol/types.js';

types
  .add({
    id: 0,
    name: 'unknown',
  })
  .add({
    id: 2278,
    name: 'void',
    decode: noop,
    encode: noop,
  })
  .add({
    id: 25,
    array: 1009,
    name: 'text',
  })
  .add({
    id: 3615,
    array: 3645,
    name: 'tsquery',
  })
  .add({
    id: 3614,
    array: 3643,
    name: 'tsvector',
  })
  .add({
    id: 142,
    array: 143,
    name: 'xml',
  })
  .add({
    id: 18,
    array: 1002,
    name: 'char',
  })
  .add({
    id: 19,
    array: 1003,
    name: 'name',
  })
  .add({
    id: 1043,
    array: 1015,
    name: 'varchar',
  })
  .add({
    id: 1042,
    array: 1014,
    name: 'bpchar',
  })
  .add({
    id: 3734,
    array: 3735,
    name: 'regconfig',
  })
  .add({
    id: 1033,
    array: 1034,
    name: 'aclitem',
  })
  .add({
    id: 194,
    name: 'pg_node_tree',
  });
