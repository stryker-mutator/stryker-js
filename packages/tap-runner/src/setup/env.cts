export const strykerDryRun = 'STRYKER_DRY_RUN';
export const strykerHitLimit = 'STRYKER_HIT_LIMIT';
export const strykerNamespace = 'STRYKER_NAMESPACE';
export function tempTapOutputFileName(pid: number | undefined): string {
  return `stryker-output-${pid}.json`;
}
