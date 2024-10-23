import { identity, isArray } from '#native';

function serializeValue(value) {
  return isArray(value)
    ? serializeArray(value)
    : this.type.quote === identity
      ? value
      : '"' +
        this.type
          .serialize(value)
          .replaceAll('\\', '\\\\')
          .replaceAll('"', '\\"') +
        '"';
}

export function serializeArray(value) {
  return '{' + value.map(serializeValue, this).join(',') + '}';
}
