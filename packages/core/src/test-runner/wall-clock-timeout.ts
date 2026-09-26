import {
  MutantRunOptions,
  MutantRunResult,
  MutantRunStatus,
  TimeoutMutantRunResult,
} from '@stryker-mutator/api/test-runner';

const BASELINE_MUTANT_ID = 'stryker-baseline';

export function wallClockTimeout(timeout: number): TimeoutMutantRunResult {
  return {
    status: MutantRunStatus.Timeout,
    reason: `Timeout of ${timeout} ms expired`,
  };
}

export function isWallClockTimeout(
  result: MutantRunResult,
  timeout: number,
): boolean {
  return (
    result.status === MutantRunStatus.Timeout &&
    result.reason === wallClockTimeout(timeout).reason
  );
}

export function toBaselineRunOptions(
  runOptions: MutantRunOptions,
): MutantRunOptions {
  return {
    ...runOptions,
    activeMutant: { ...runOptions.activeMutant, id: BASELINE_MUTANT_ID },
    hitLimit: undefined,
  };
}
