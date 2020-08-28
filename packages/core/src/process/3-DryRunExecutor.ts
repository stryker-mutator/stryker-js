import { EOL } from 'os';

import { Injector } from 'typed-inject';
import { I } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import {
  DryRunResult,
  TestRunner2,
  DryRunStatus,
  CompleteDryRunResult,
  TestStatus,
  TestResult,
  FailedTestResult,
  ErrorDryRunResult,
} from '@stryker-mutator/api/test_runner';
import { first } from 'rxjs/operators';

import { Checker } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { Sandbox } from '../sandbox/sandbox';
import Timer from '../utils/Timer';
import { createTestRunnerFactory } from '../test-runner';
import { MutationTestReportHelper } from '../reporters/MutationTestReportHelper';
import { ConfigError } from '../errors';
import { findMutantTestCoverage } from '../mutants';
import { Pool, createTestRunnerPool } from '../concurrent/pool';
import { ConcurrencyTokenProvider } from '../concurrent';

import { MutationTestContext } from './4-MutationTestExecutor';
import { MutantInstrumenterContext } from './2-MutantInstrumenterExecutor';

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;
const INITIAL_TEST_RUN_MARKER = 'Initial test run';

export interface DryRunContext extends MutantInstrumenterContext {
  [coreTokens.sandbox]: Sandbox;
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
    this.log.info('Starting initial test run. This may take a while.');
    const testRunner = await testRunnerPool.worker$.pipe(first()).toPromise();
    const { dryRunResult, grossTimeMS } = await this.timeDryRun(testRunner);
    this.validateResultCompleted(dryRunResult);
    const timing = this.calculateTiming(grossTimeMS, dryRunResult.tests);
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
  private async timeDryRun(testRunner: TestRunner2): Promise<{ dryRunResult: DryRunResult; grossTimeMS: number }> {
    this.timer.mark(INITIAL_TEST_RUN_MARKER);
    const dryRunResult = await testRunner.dryRun({ timeout: INITIAL_RUN_TIMEOUT, coverageAnalysis: this.options.coverageAnalysis });
    const grossTimeMS = this.timer.elapsedMs(INITIAL_TEST_RUN_MARKER);
    return { dryRunResult, grossTimeMS };
  }

  private logInitialTestRunSucceeded(tests: TestResult[], timing: Timing) {
    this.log.info(
      'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
      tests.length,
      this.timer.humanReadableElapsed(),
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
  private calculateTiming(grossTimeMS: number, tests: readonly TestResult[]): Timing {
    const netTimeMS = tests.reduce((total, test) => total + test.timeSpentMs, 0);
    const overheadTimeMS = grossTimeMS - netTimeMS;
    return {
      net: netTimeMS,
      overhead: overheadTimeMS < 0 ? 0 : overheadTimeMS,
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
    let message = `One or more tests resulted in an error:${EOL}\t${runResult.errorMessage}`;
    this.log.error(message);
  }

  private logTimeoutInitialRun() {
    this.log.error('Initial test run timed out!');
  }
}
