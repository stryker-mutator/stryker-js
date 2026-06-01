// `run({ isolation: 'none' })` — required so the instrumented SUT and the Stryker
// globals share one thread — is available since Node 22.8.0. On older runtimes
// the option is ignored and tests run in child processes, where mutants can't be
// activated (everything would survive), so the runner fails fast instead.
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
