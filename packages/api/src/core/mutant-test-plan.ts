import * as schema from 'mutation-testing-report-schema/api';

import { MutantRunOptions } from '../test-runner/index.js';

import { MutantTestCoverage } from './mutant.js';

/**
 * Represents a plan to test a mutant. Can either be an early result (an ignored mutant for example) or a plan to test a mutant in a test runner
 */
export type MutantTestPlan = MutantEarlyResultPlan | MutantRunPlan;

/**
 * The test plans that belong to a mutant.
 */
export enum PlanKind {
  /**
   * Early result plan, mutant does not have to be checked or run.
   */
  EarlyResult = 'EarlyResult',
  /**
   * Run plan, mutant will have to be checked and run.
   */
  Run = 'Run',
}

/**
 * Represents an mutant early result plan.
 */
export interface MutantEarlyResultPlan {
  plan: PlanKind.EarlyResult;
  /**
   * The mutant that already has a final status.
   */
  mutant: MutantTestCoverage & { status: schema.MutantStatus };
}

/**
 * Represents a mutant test plan.
 */
export interface MutantRunPlan {
  plan: PlanKind.Run;
  /**
   * The mutant that has to be tested.
   */
  mutant: MutantTestCoverage;
  /**
   * The run options that will be used to test this mutant
   */
  runOptions: MutantRunOptions;

  /**
   * Estimated net time to run this mutant when it would survive in ms (which should be the worst case).
   * This is used as input to calculate the runOptions.timeout
   */
  netTime: number;
}
