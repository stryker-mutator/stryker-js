/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}
