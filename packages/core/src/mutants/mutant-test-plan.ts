import { MutantStatus, MutantTestCoverage } from '@stryker-mutator/api/core';
import { MutantRunOptions } from '@stryker-mutator/api/test-runner';

/**
 * Represents an internal object
 */
export type MutantTestPlan = MutantEarlyResultPlan | MutantRunPlan;

export enum PlanKind {
  EarlyResult = 'EarlyResult',
  Run = 'Run',
}

export interface MutantEarlyResultPlan {
  plan: PlanKind.EarlyResult;
  mutant: MutantTestCoverage & { status: MutantStatus };
}

export interface MutantRunPlan {
  plan: PlanKind.Run;
  mutant: MutantTestCoverage;
  runOptions: MutantRunOptions;
}
