import { EOL } from 'os';

import { I, requireResolve } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens, Injector } from '@stryker-mutator/api/plugin';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import { DryRunCompletedEvent, RunTiming } from '@stryker-mutator/api/report';
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
import { lastValueFrom, of } from 'rxjs';

import { coreTokens } from '../di/index.js';
import { Sandbox } from '../sandbox/sandbox.js';
import { Timer } from '../utils/timer.js';
import { createTestRunnerFactory } from '../test-runner/index.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { ConfigError } from '../errors.js';
import {
  ConcurrencyTokenProvider,
  Pool,
  createTestRunnerPool,
} from '../concurrent/index.js';
import { FileMatcher } from '../config/index.js';
import {
  IncrementalDiffer,
  MutantTestPlanner,
  TestCoverage,
} from '../mutants/index.js';
import { CheckerFacade } from '../checker/index.js';
import { StrictReporter } from '../reporters/index.js';
import { objectUtils } from '../utils/object-utils.js';

import { IdGenerator } from '../child-proxy/id-generator.js';

import { MutationTestContext } from './4-mutation-test-executor.js';
import { MutantInstrumenterContext } from './2-mutant-instrumenter-executor.js';

const INITIAL_TEST_RUN_MARKER = 'Initial test run';

export interface DryRunContext extends MutantInstrumenterContext {
  [coreTokens.sandbox]: I<Sandbox>;
  [coreTokens.mutants]: readonly Mutant[];
  [coreTokens.checkerPool]: I<Pool<I<CheckerFacade>>>;
  [coreTokens.concurrencyTokenProvider]: I<ConcurrencyTokenProvider>;
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
    coreTokens.concurrencyTokenProvider,
    coreTokens.sandbox,
    coreTokens.reporter,
  );

  constructor(
    private readonly injector: Injector<DryRunContext>,
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>,
    private readonly sandbox: I<Sandbox>,
    private readonly reporter: StrictReporter,
  ) {}

  public async execute(): Promise<Injector<MutationTestContext>> {
    const testRunnerInjector = this.injector
      .provideClass(coreTokens.workerIdGenerator, IdGenerator)
      .provideFactory(coreTokens.testRunnerFactory, createTestRunnerFactory)
      .provideValue(
        coreTokens.testRunnerConcurrencyTokens,
        this.concurrencyTokenProvider.testRunnerToken$,
      )
      .provideFactory(coreTokens.testRunnerPool, createTestRunnerPool);
    const testRunnerPool = testRunnerInjector.resolve(
      coreTokens.testRunnerPool,
    );
    const { result, timing, excludedTestIds } = await lastValueFrom(
      testRunnerPool.schedule(of(0), (testRunner) =>
        this.executeDryRun(testRunner),
      ),
    );

    this.logInitialTestRunSucceeded(result.tests, timing);
    if (!result.tests.length && !this.options.allowEmpty) {
      throw new ConfigError(
        'No tests were executed. Stryker will exit prematurely. Please check your configuration.',
      );
    }

    return testRunnerInjector
      .provideValue(coreTokens.timeOverheadMS, timing.overhead)
      .provideValue(coreTokens.dryRunResult, result)
      .provideValue(coreTokens.excludedTestIds, excludedTestIds)
      .provideValue(coreTokens.requireFromCwd, requireResolve)
      .provideFactory(coreTokens.testCoverage, TestCoverage.from)
      .provideClass(coreTokens.incrementalDiffer, IncrementalDiffer)
      .provideClass(coreTokens.mutantTestPlanner, MutantTestPlanner)
      .provideClass(
        coreTokens.mutationTestReportHelper,
        MutationTestReportHelper,
      )
      .provideClass(coreTokens.workerIdGenerator, IdGenerator);
  }

  private validateResultCompleted(
    runResult: DryRunResult,
  ): asserts runResult is CompleteDryRunResult {
    switch (runResult.status) {
      case DryRunStatus.Complete: {
        const failedTests = runResult.tests.filter(isFailedTest);
        if (!failedTests.length) {
          return;
        }
        // Compare unique ids: a runner can report the same test twice, e.g. mocha
        // reports an `afterEach` hook failure under the id of a test that passed.
        // Only a passed test leaves something to run mutants against; skipped tests don't.
        const failedTestIds = new Set(failedTests.map(({ id }) => id));
        const hasPassedTest = runResult.tests.some(
          ({ id, status }) =>
            status === TestStatus.Success && !failedTestIds.has(id),
        );
        if (this.options.ignoreFailedTestsInDryRun && hasPassedTest) {
          this.logFailedTestsInInitialRun(failedTests, 'warn');
          this.log.warn(
            `Continuing without these ${failedTestIds.size} failed test(s), because "ignoreFailedTestsInDryRun" is enabled. With "perTest" coverage analysis, mutants only covered by them will be reported as NoCoverage; otherwise they will likely survive.`,
          );
          return;
        }
        this.logFailedTestsInInitialRun(failedTests, 'error');
        throw new ConfigError(
          this.options.ignoreFailedTestsInDryRun
            ? 'No passing tests remain after the failed tests in the initial test run, so there are no tests left to run mutants against.'
            : 'There were failed tests in the initial test run.',
        );
      }
      case DryRunStatus.Error:
        this.logErrorsInInitialRun(runResult);
        break;
      case DryRunStatus.Timeout:
        this.logTimeoutInitialRun();
        break;
    }
    throw new Error('Something went wrong in the initial test run');
  }

  private async executeDryRun(
    testRunner: TestRunner,
  ): Promise<DryRunCompletedEvent & { excludedTestIds: string[] }> {
    if (this.options.dryRunOnly) {
      this.log.info(
        'Note: running the dry-run only. No mutations will be tested.',
      );
    }

    const dryRunTimeout = this.options.dryRunTimeoutMinutes * 1000 * 60;
    const project = this.injector.resolve(coreTokens.project);
    const dryRunFiles = objectUtils.map(project.filesToMutate, (_, name) =>
      this.sandbox.sandboxFileFor(name),
    );
    const testFiles =
      project.testFiles.length > 0
        ? project.testFiles.map((file) => this.sandbox.sandboxFileFor(file))
        : undefined;
    this.timer.mark(INITIAL_TEST_RUN_MARKER);
    this.log.info(
      `Starting initial test run (${this.options.testRunner} test runner with "${this.options.coverageAnalysis}" coverage analysis). This may take a while.`,
    );
    this.log.debug(`Using timeout of ${dryRunTimeout} ms.`);
    const result = await testRunner.dryRun({
      timeout: dryRunTimeout,
      coverageAnalysis: this.options.coverageAnalysis,
      // A runner that bails at the first failure would cut the suite short, and the tests
      // that never ran would be dropped along with the failed ones.
      disableBail:
        this.options.disableBail || this.options.ignoreFailedTestsInDryRun,
      files: dryRunFiles,
      testFiles,
    });
    const grossTimeMS = this.timer.elapsedMs(INITIAL_TEST_RUN_MARKER);
    const capabilities = await testRunner.capabilities();
    this.validateResultCompleted(result);

    this.remapSandboxFilesToOriginalFiles(result);
    // Timing includes the failed tests: their time was spent on testing, not overhead
    const timing = this.calculateTiming(grossTimeMS, result.tests);
    const excludedTestIds = this.excludeFailedTests(result);
    const dryRunCompleted = { result, timing, capabilities };
    this.reporter.onDryRunCompleted(dryRunCompleted);
    return { ...dryRunCompleted, excludedTestIds };
  }

  /**
   * Removes failed tests (only present with `ignoreFailedTestsInDryRun`) from the result and its per-test coverage,
   * so they're never used to cover or kill a mutant.
   * @returns the ids of the removed tests
   */
  private excludeFailedTests(result: CompleteDryRunResult): string[] {
    // Exclude by id, not by status: a test that both passed and failed (e.g. a
    // failing mocha `afterEach` hook) must not survive through its passed result.
    const excludedTestIds = [
      ...new Set(result.tests.filter(isFailedTest).map(({ id }) => id)),
    ];
    if (excludedTestIds.length) {
      const excluded = new Set(excludedTestIds);
      result.tests = result.tests.filter(({ id }) => !excluded.has(id));
      if (result.mutantCoverage) {
        for (const testId of excludedTestIds) {
          delete result.mutantCoverage.perTest[testId];
        }
      }
    }
    return excludedTestIds;
  }

  /**
   * Remaps test files to their respective original names outside the sandbox.
   * @param dryRunResult the completed result
   */
  private remapSandboxFilesToOriginalFiles(dryRunResult: CompleteDryRunResult) {
    const disableTypeCheckingFileMatcher = new FileMatcher(
      this.options.disableTypeChecks,
    );
    dryRunResult.tests.forEach((test) => {
      if (test.fileName) {
        test.fileName = this.sandbox.originalFileFor(test.fileName);

        // HACK line numbers of the tests can be offset by 1 because the disable type checks preprocessor could have added a `// @ts-nocheck` line.
        // We correct for that here if needed
        // If we do more complex stuff in sandbox preprocessing in the future, we might want to add a robust remapping logic
        if (
          test.startPosition &&
          disableTypeCheckingFileMatcher.matches(test.fileName)
        ) {
          test.startPosition.line--;
        }
      }
    });
  }

  private logInitialTestRunSucceeded(tests: TestResult[], timing: RunTiming) {
    if (!tests.length) {
      this.log.info('No tests were found');
      return;
    }

    this.log.info(
      'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
      tests.length,
      this.timer.humanReadableElapsed(INITIAL_TEST_RUN_MARKER),
      timing.net,
      timing.overhead,
    );
  }

  /**
   * Calculates the timing variables for the test run.
   * grossTime = NetTime + overheadTime
   *
   * The overhead time is used to calculate exact timeout values during mutation testing.
   * See timeoutMS setting in README for more information on this calculation
   */
  private calculateTiming(
    grossTimeMS: number,
    tests: readonly TestResult[],
  ): RunTiming {
    const netTimeMS = tests.reduce(
      (total, test) => total + test.timeSpentMs,
      0,
    );
    const overheadTimeMS = grossTimeMS - netTimeMS;
    return {
      net: netTimeMS,
      overhead: overheadTimeMS < 0 ? 0 : overheadTimeMS,
    };
  }

  private logFailedTestsInInitialRun(
    failedTests: FailedTestResult[],
    level: 'error' | 'warn',
  ): void {
    // A test can fail more than once, e.g. in itself and in its `afterEach` hook.
    // List it once, with every failure message.
    const failuresByTest = new Map<
      string,
      { name: string; messages: string[] }
    >();
    for (const { id, name, failureMessage } of failedTests) {
      const key = `${id}\0${name}`;
      const failures = failuresByTest.get(key) ?? { name, messages: [] };
      failures.messages.push(failureMessage);
      failuresByTest.set(key, failures);
    }
    let message = 'One or more tests failed in the initial test run:';
    for (const { name, messages } of failuresByTest.values()) {
      message += `${EOL}\t${name}`;
      messages.forEach((failureMessage) => {
        message += `${EOL}\t\t${failureMessage}`;
      });
    }
    this.log[level](message);
  }
  private logErrorsInInitialRun(runResult: ErrorDryRunResult) {
    const message = `One or more tests resulted in an error:${EOL}\t${runResult.errorMessage}`;
    this.log.error(message);
  }

  private logTimeoutInitialRun() {
    this.log.error('Initial test run timed out!');
  }
}
