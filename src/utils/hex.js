export const byteToHex = Array.from({ length: 256 }, (_, i) =>
  (i + 0x100).toString(16).slice(1)
);
