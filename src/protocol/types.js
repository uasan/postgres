import { uuid } from '../types/uuid.js';
import { bool } from '../types/bool.js';
import { bit, varbit, bytea } from '../types/bin.js';
import { unknown } from '../types/unknown.js';
import { json, jsonb } from '../types/json.js';
import { record } from '../types/record/type.js';
import { voidType } from '../types/void.js';
import * as date from '../types/date.js';
import * as text from '../types/text.js';
import * as number from '../types/number.js';
import * as range from '../types/range.js';
import * as geo from '../types/geo.js';
import { typeArrayOf } from '../types/array/type.js';

export { unknown };
export { bytea as blob };

export const types = {
  16: bool,
  17: bytea,
  18: text.char,
  19: text.name,
  20: number.int8,
  21: number.int2,
  22: typeArrayOf(number.int2),
  23: number.int4,
  24: number.regproc,
  25: text.text,
  26: number.oid,
  28: number.xid,
  29: number.cid,
  30: typeArrayOf(number.oid),
  114: json,
  142: text.xml,
  143: typeArrayOf(text.xml),
  194: text.pgNodeTree,
  199: typeArrayOf(json),
  600: geo.point,
  601: geo.lseg,
  602: geo.path,
  603: geo.box,
  604: geo.polygon,
  628: geo.line,
  629: typeArrayOf(geo.line),
  700: number.float4,
  701: number.float8,
  705: unknown,
  718: geo.circle,
  719: typeArrayOf(geo.circle),
  790: number.money,
  791: typeArrayOf(number.money),
  1000: typeArrayOf(bool),
  1001: typeArrayOf(bytea),
  1002: typeArrayOf(text.char),
  1003: typeArrayOf(text.name),
  1005: typeArrayOf(number.int2),
  1007: typeArrayOf(number.int4),
  1008: typeArrayOf(number.regproc),
  1009: typeArrayOf(text.text),
  1011: typeArrayOf(number.xid),
  1012: typeArrayOf(number.cid),
  1015: typeArrayOf(text.varchar),
  1016: typeArrayOf(number.int8),
  1017: typeArrayOf(geo.point),
  1018: typeArrayOf(geo.lseg),
  1019: typeArrayOf(geo.path),
  1020: typeArrayOf(geo.box),
  1021: typeArrayOf(number.float4),
  1022: typeArrayOf(number.float8),
  1028: typeArrayOf(number.oid),
  1033: text.aclitem,
  1034: typeArrayOf(text.aclitem),
  1043: text.varchar,
  1082: date.date,
  1083: date.time,
  1114: date.timestamp,
  1115: typeArrayOf(date.timestamp),
  1027: typeArrayOf(geo.polygon),
  1183: typeArrayOf(date.time),
  1182: typeArrayOf(date.date),
  1184: date.timestamptz,
  1185: typeArrayOf(date.timestamptz),
  1186: date.interval,
  1187: typeArrayOf(date.interval),
  1231: typeArrayOf(number.numeric),
  1560: bit,
  1561: typeArrayOf(bit),
  1562: varbit,
  1563: typeArrayOf(varbit),
  1700: number.numeric,
  2249: record,
  2278: voidType,
  2287: typeArrayOf(record),
  2950: uuid,
  2951: typeArrayOf(uuid),
  3614: text.tsvector,
  3615: text.tsquery,
  3643: typeArrayOf(text.tsvector),
  3645: typeArrayOf(text.tsquery),
  3802: jsonb,
  3807: typeArrayOf(jsonb),
  3904: range.int4range,
  3905: typeArrayOf(range.int4range),
  3906: range.numrange,
  3907: typeArrayOf(range.numrange),
  3908: range.tsrange,
  3909: typeArrayOf(range.tsrange),
  3910: range.tstzrange,
  3911: typeArrayOf(range.tstzrange),
  3912: range.daterange,
  3913: typeArrayOf(range.daterange),
  3926: range.int8range,
  3927: typeArrayOf(range.int8range),
  4532: range.nummultirange,
  4451: range.int4multirange,
  4535: range.datemultirange,
  4536: range.int8multirange,
  6150: typeArrayOf(range.int4multirange),
  6151: typeArrayOf(range.nummultirange),
  6155: typeArrayOf(range.datemultirange),
  6157: typeArrayOf(range.int8multirange),
  16385: geo.cube,
  16390: typeArrayOf(geo.cube),
  16475: typeArrayOf(geo.earth),
  16476: geo.earth,
};
