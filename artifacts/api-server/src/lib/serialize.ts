export function serializeDates<T extends Record<string, unknown>>(
  record: T,
): { [K in keyof T]: T[K] extends Date ? string : T[K] } {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    const val = record[key];
    result[key] = val instanceof Date ? val.toISOString() : val;
  }
  return result as { [K in keyof T]: T[K] extends Date ? string : T[K] };
}

export function serializeRows<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map(serializeDates);
}
