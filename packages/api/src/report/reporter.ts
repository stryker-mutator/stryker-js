import { MutationTestMetricsResult } from 'mutation-testing-metrics';

import { MutantResult, MutantTestCoverage, schema } from '../core';

import { SourceFile } from './source-file';

/**
 * Represents a reporter which can report during or after a Stryker run
 */
export interface Reporter {
  /**
   * Called when a source file was loaded
   * @param file The immutable source file
   */
  onSourceFileRead?(file: Readonly<SourceFile>): void;

  /**
   * Called when all source files were loaded
   * @param files The immutable source files
   */
  onAllSourceFilesRead?(files: ReadonlyArray<Readonly<SourceFile>>): void;

  /**
   * Called when mutants are matched with tests
   * @param results The immutable array of mutants
   */
  onAllMutantsMatchedWithTests?(results: ReadonlyArray<Readonly<MutantTestCoverage>>): void;

  /**
   * Called when a mutant was tested
   * @param result The immutable result
   */
  onMutantTested?(result: Readonly<MutantResult>): void;

  /**
   * Called when all mutants were tested
   * @param results The immutable results
   */
  onAllMutantsTested?(results: ReadonlyArray<Readonly<MutantResult>>): void;

  /**
   * Called when mutation testing is done
   * @param report the mutation test result that is valid according to the mutation-testing-report-schema (json schema)
   * @see https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema#mutation-testing-elements-schema
   */
  onMutationTestReportReady?(report: Readonly<schema.MutationTestResult>, metrics: Readonly<MutationTestMetricsResult>): void;

  /**
   * Called when stryker wants to quit
   * Gives a reporter the ability to finish up any async tasks
   * Stryker will not close until the promise is either resolved or rejected.
   * @return a promise which will resolve when the reporter is done reporting
   */
  wrapUp?(): Promise<void> | void;
}
