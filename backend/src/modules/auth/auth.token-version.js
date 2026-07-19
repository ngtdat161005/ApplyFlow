export const DEFAULT_TOKEN_VERSION = 0;

export function normalizeTokenVersion(value) {
  if (value === undefined) {
    return DEFAULT_TOKEN_VERSION;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}
