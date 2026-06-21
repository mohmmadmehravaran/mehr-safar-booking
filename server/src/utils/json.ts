/** Helpers to (de)serialize the JSON-encoded array columns used with SQLite. */
export const parseArray = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const stringifyArray = (value: unknown): string =>
  JSON.stringify(Array.isArray(value) ? value : []);
