import { MutationTestMetricsResult } from 'mutation-testing-metrics';

import { MutantResult, schema } from '../core/index.js';

import { DryRunCompletedEvent } from './dry-run-completed-event.js';
import { MutationTestingPlanReadyEvent } from './mutation-testing-plan-ready-event.js';

/**
 * Represents a reporter which can report during or after a Stryker run
 */
export interface Reporter {
  /**
   * An event emitted when the dry run completed successfully.
   * @param event The dry run completed event
   */
  onDryRunCompleted?(event: DryRunCompletedEvent): void;

  /**
   * An event emitted when the mutant test plan is calculated.
   * @param event The mutant test plan ready event
   */
  onMutationTestingPlanReady?(event: MutationTestingPlanReadyEvent): void;

  /**
   * Called when a mutant was tested
   * @param result The immutable result
   */
  onMutantTested?(result: Readonly<MutantResult>): void;

  /**
   * Called when mutation testing is done
   * @param report the mutation test result that is valid according to the mutation-testing-report-schema (json schema)
   * @see https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/src/mutation-testing-report-schema.json
   */
  onMutationTestReportReady?(
    report: Readonly<schema.MutationTestResult>,
    metrics: Readonly<MutationTestMetricsResult>,
  ): void;

  /**
   * Called when stryker wants to quit
   * Gives a reporter the ability to finish up any async tasks
   * Stryker will not close until the promise is either resolved or rejected.
   * @return a promise which will resolve when the reporter is done reporting
   */
  wrapUp?(): Promise<void> | void;
}
