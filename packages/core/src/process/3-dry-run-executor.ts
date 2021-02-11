import { EOL } from 'os';

import { Injector } from 'typed-inject';
import { I } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import {
  DryRunResult,
  TestRunner,
  DryRunStatus,
  CompleteDryRunResult,
  TestStatus,
  TestResult,
  FailedTestResult,
  ErrorDryRunResult,
} from '@stryker-mutator/api/test-runner';
import { of } from 'rxjs';
import { Checker } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { Sandbox } from '../sandbox/sandbox';
import { Timer } from '../utils/timer';
import { createTestRunnerFactory } from '../test-runner';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper';
import { ConfigError } from '../errors';
import { findMutantTestCoverage } from '../mutants';
import { Pool, createTestRunnerPool } from '../concurrent/pool';
import { ConcurrencyTokenProvider } from '../concurrent';

import { MutationTestContext } from './4-mutation-test-executor';
import { MutantInstrumenterContext } from './2-mutant-instrumenter-executor';

const INITIAL_TEST_RUN_MARKER = 'Initial test run';

export interface DryRunContext extends MutantInstrumenterContext {
  [coreTokens.sandbox]: I<Sandbox>;
  [coreTokens.mutants]: readonly Mutant[];
  [coreTokens.checkerPool]: I<Pool<Checker>>;
  [coreTokens.concurrencyTokenProvider]: I<ConcurrencyTokenProvider>;
}

/**
 * A small object that keeps the timing variables of a test run.
 */
interface Timing {
  /**
   * The time that the test runner was actually executing tests in milliseconds.
   */
  net: number;
  /**
   * the time that was spend not executing tests in milliseconds.
   * So the time it took to start the test runner and to report the result.
   */
  overhead: number;

  /**
   * The total time spent (net + overhead) in a human readable format
   */
  humanReadableTimeElapsed: string;
}

function isFailedTest(testResult: TestResult): testResult is FailedTestResult {
  return testResult.status === TestStatus.Failed;
}

export class DryRunExecutor {
  public static readonly inject = tokens(
    commonTokens.injector,
    commonTokens.logger,
    commonTokens.options,
    coreTokens.timer,
    coreTokens.concurrencyTokenProvider
  );

  constructor(
    private readonly injector: Injector<DryRunContext>,
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>
  ) {}

  public async execute(): Promise<Injector<MutationTestContext>> {
    const testRunnerInjector = this.injector
      .provideFactory(coreTokens.testRunnerFactory, createTestRunnerFactory)
      .provideValue(coreTokens.testRunnerConcurrencyTokens, this.concurrencyTokenProvider.testRunnerToken$)
      .provideFactory(coreTokens.testRunnerPool, createTestRunnerPool);
    const testRunnerPool = testRunnerInjector.resolve(coreTokens.testRunnerPool);
    const { dryRunResult, timing } = await testRunnerPool.schedule(of(0), (testRunner) => this.timeDryRun(testRunner)).toPromise();

    this.logInitialTestRunSucceeded(dryRunResult.tests, timing);
    if (!dryRunResult.tests.length) {
      throw new ConfigError('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
    }
    return testRunnerInjector
      .provideValue(coreTokens.timeOverheadMS, timing.overhead)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .provideClass(coreTokens.mutationTestReportHelper, MutationTestReportHelper)
      .provideFactory(coreTokens.mutantsWithTestCoverage, findMutantTestCoverage);
  }

  private validateResultCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
    switch (runResult.status) {
      case DryRunStatus.Complete:
        const failedTests = runResult.tests.filter(isFailedTest);
        if (failedTests.length) {
          this.logFailedTestsInInitialRun(failedTests);
          throw new ConfigError('There were failed tests in the initial test run.');
        }
        return;
      case DryRunStatus.Error:
        this.logErrorsInInitialRun(runResult);
        break;
      case DryRunStatus.Timeout:
        this.logTimeoutInitialRun();
        break;
    }
    throw new Error('Something went wrong in the initial test run');
  }

  private async timeDryRun(testRunner: TestRunner): Promise<{ dryRunResult: CompleteDryRunResult; timing: Timing }> {
    const dryRunTimeout = this.options.dryRunTimeoutMinutes * 1000 * 60;
    this.timer.mark(INITIAL_TEST_RUN_MARKER);
    this.log.info('Starting initial test run. This may take a while.');
    this.log.debug(`Using timeout of ${dryRunTimeout} ms.`);
    const dryRunResult = await testRunner.dryRun({ timeout: dryRunTimeout, coverageAnalysis: this.options.coverageAnalysis });
    const grossTimeMS = this.timer.elapsedMs(INITIAL_TEST_RUN_MARKER);
    const humanReadableTimeElapsed = this.timer.humanReadableElapsed(INITIAL_TEST_RUN_MARKER);
    this.validateResultCompleted(dryRunResult);
    const timing = this.calculateTiming(grossTimeMS, humanReadableTimeElapsed, dryRunResult.tests);
    return { dryRunResult, timing };
  }

  private logInitialTestRunSucceeded(tests: TestResult[], timing: Timing) {
    this.log.info(
      'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
      tests.length,
      timing.humanReadableTimeElapsed,
      timing.net,
      timing.overhead
    );
  }

  /**
   * Calculates the timing variables for the test run.
   * grossTime = NetTime + overheadTime
   *
   * The overhead time is used to calculate exact timeout values during mutation testing.
   * See timeoutMS setting in README for more information on this calculation
   */
  private calculateTiming(grossTimeMS: number, humanReadableTimeElapsed: string, tests: readonly TestResult[]): Timing {
    const netTimeMS = tests.reduce((total, test) => total + test.timeSpentMs, 0);
    const overheadTimeMS = grossTimeMS - netTimeMS;
    return {
      net: netTimeMS,
      overhead: overheadTimeMS < 0 ? 0 : overheadTimeMS,
      humanReadableTimeElapsed,
    };
  }

  private logFailedTestsInInitialRun(failedTests: FailedTestResult[]): void {
    let message = 'One or more tests failed in the initial test run:';
    failedTests.forEach((test) => {
      message += `${EOL}\t${test.name}`;
      message += `${EOL}\t\t${test.failureMessage}`;
    });
    this.log.error(message);
  }
  private logErrorsInInitialRun(runResult: ErrorDryRunResult) {
    const message = `One or more tests resulted in an error:${EOL}\t${runResult.errorMessage}`;
    this.log.error(message);
  }

  private logTimeoutInitialRun() {
    this.log.error('Initial test run timed out!');
  }
}
