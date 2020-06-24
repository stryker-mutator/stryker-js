import assert = require('assert');

import {
  MutantRunResult,
  SurvivedMutantRunResult,
  ErrorDryRunResult,
  KilledMutantRunResult,
  MutantRunStatus,
  DryRunResult,
  CompleteDryRunResult,
  DryRunStatus,
  ErrorMutantRunResult,
} from '@stryker-mutator/api/test_runner2';

export function expectKilled(result: MutantRunResult): asserts result is KilledMutantRunResult {
  assert.equal(result.status, MutantRunStatus.Killed);
}

export function expectCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
  assert.equal(runResult.status, DryRunStatus.Complete);
}

export function expectErrored(runResult: MutantRunResult): asserts runResult is ErrorMutantRunResult;
export function expectErrored(runResult: DryRunResult): asserts runResult is ErrorDryRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): void {
  assert.equal(runResult.status, DryRunStatus.Error);
}
export function expectSurvived(runResult: MutantRunResult): asserts runResult is SurvivedMutantRunResult {
  assert.equal(runResult.status, MutantRunStatus.Survived);
}
