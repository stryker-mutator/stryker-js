/**
 * Tells whether the filesystem is case sensitive.
 *
 * @returns false on Win32, true elsewhere
 */
export function caseSensitiveFs(): boolean {
  return process.platform != 'win32';
}
