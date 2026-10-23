// Older runtimes ignore `run({ isolation: 'none' })` and run files in child processes,
// where coverage/hitCount accrue out of this runner's sight, so fail fast instead.
export const MIN_NODE_VERSION = '22.8.0';

export function isSupportedNodeVersion(
  version: string,
  min: string = MIN_NODE_VERSION,
): boolean {
  const current = version.split('.').map(Number);
  const minimum = min.split('.').map(Number);
  for (let i = 0; i < minimum.length; i++) {
    const part = current[i] ?? 0;
    if (part > minimum[i]) return true;
    if (part < minimum[i]) return false;
  }
  return true;
}
