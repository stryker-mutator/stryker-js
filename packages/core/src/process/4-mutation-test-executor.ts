import { from, partition, merge, Observable, lastValueFrom } from 'rxjs';
import { toArray, map, tap, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { MutantTestCoverage, MutantResult, StrykerOptions, MutantStatus } from '@stryker-mutator/api/core';
import { MutantRunOptions, TestRunner } from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';
import { CheckStatus, Checker, CheckResult, PassedCheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper';
import { Timer } from '../utils/timer';
import { Pool, ConcurrencyTokenProvider } from '../concurrent';
import { Sandbox } from '../sandbox';

import { DryRunContext } from './3-dry-run-executor';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner>>;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportHelper]: MutationTestReportHelper;
  [coreTokens.mutantsWithTestCoverage]: MutantTestCoverage[];
}

/**
 * The factor by which hit count from dry run is multiplied to calculate the hit limit for a mutant.
 * This is intentionally a high value to prevent false positives.
 *
 * For example, a property testing library might execute a failing scenario multiple times to determine the smallest possible counterexample.
 * @see https://jsverify.github.io/#minimal-counterexample
 */
const HIT_LIMIT_FACTOR = 100;

export class MutationTestExecutor {
  public static inject = tokens(
    commonTokens.options,
    coreTokens.reporter,
    coreTokens.checkerPool,
    coreTokens.testRunnerPool,
    coreTokens.timeOverheadMS,
    coreTokens.mutantsWithTestCoverage,
    coreTokens.mutationTestReportHelper,
    coreTokens.sandbox,
    commonTokens.logger,
    coreTokens.timer,
    coreTokens.concurrencyTokenProvider
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly reporter: StrictReporter,
    private readonly checkerPool: I<Pool<Checker>>,
    private readonly testRunnerPool: I<Pool<TestRunner>>,
    private readonly timeOverheadMS: number,
    private readonly matchedMutants: readonly MutantTestCoverage[],
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly sandbox: I<Sandbox>,
    private readonly log: Logger,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const { ignoredResult$, notIgnoredMutant$ } = this.executeIgnore(from(this.matchedMutants));
    const { passedMutant$, checkResult$ } = this.executeCheck(from(notIgnoredMutant$));
    const { coveredMutant$, noCoverageResult$ } = this.executeNoCoverage(passedMutant$);
    const testRunnerResult$ = this.executeRunInTestRunner(coveredMutant$);
    const results = await lastValueFrom(merge(testRunnerResult$, checkResult$, noCoverageResult$, ignoredResult$).pipe(toArray()));
    this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private executeIgnore(input$: Observable<MutantTestCoverage>) {
    const [ignoredMutant$, notIgnoredMutant$] = partition(input$.pipe(shareReplay()), (mutant) => mutant.status === MutantStatus.Ignored);
    const ignoredResult$ = ignoredMutant$.pipe(map((mutant) => this.mutationTestReportHelper.reportMutantStatus(mutant, MutantStatus.Ignored)));
    return { ignoredResult$, notIgnoredMutant$ };
  }

  private executeNoCoverage(input$: Observable<MutantTestCoverage>) {
    const [noCoverageMatchedMutant$, coveredMutant$] = partition(
      input$.pipe(shareReplay()),
      (mutant) => !mutant.static && (mutant.coveredBy?.length ?? 0) === 0
    );
    const noCoverageResult$ = noCoverageMatchedMutant$.pipe(
      map((mutant) => this.mutationTestReportHelper.reportMutantStatus(mutant, MutantStatus.NoCoverage))
    );
    return { noCoverageResult$, coveredMutant$ };
  }

  private executeCheck(input$: Observable<MutantTestCoverage>) {
    const checkTask$ = this.checkerPool
      .schedule(input$, async (checker, mutant) => {
        const checkResult = await checker.check(mutant);
        return {
          checkResult,
          mutant,
        };
      })
      .pipe(
        // Dispose when all checks are completed.
        // This will allow resources to be freed up and more test runners to be spined up.
        tap({
          complete: () => {
            this.checkerPool.dispose();
            this.concurrencyTokenProvider.freeCheckers();
          },
        }),
        shareReplay()
      );
    const [passedCheckResult$, failedCheckResult$] = partition(checkTask$, ({ checkResult }) => checkResult.status === CheckStatus.Passed);
    const checkResult$ = failedCheckResult$.pipe(
      map((failedMutant) =>
        this.mutationTestReportHelper.reportCheckFailed(failedMutant.mutant, failedMutant.checkResult as Exclude<CheckResult, PassedCheckResult>)
      )
    );
    const passedMutant$ = passedCheckResult$.pipe(map(({ mutant }) => mutant));
    return { checkResult$, passedMutant$ };
  }

  private executeRunInTestRunner(input$: Observable<MutantTestCoverage>): Observable<MutantResult> {
    return this.testRunnerPool.schedule(input$, async (testRunner, mutant) => {
      const mutantRunOptions = this.createMutantRunOptions(mutant);
      const result = await testRunner.mutantRun(mutantRunOptions);
      return this.mutationTestReportHelper.reportMutantRunResult(mutant, result);
    });
  }

  private createMutantRunOptions(activeMutant: MutantTestCoverage): MutantRunOptions {
    const timeout = this.options.timeoutFactor * activeMutant.estimatedNetTime + this.options.timeoutMS + this.timeOverheadMS;
    const hitLimit = activeMutant.hitCount === undefined ? undefined : activeMutant.hitCount * HIT_LIMIT_FACTOR;
    return {
      activeMutant,
      timeout,
      testFilter: activeMutant.coveredBy,
      sandboxFileName: this.sandbox.sandboxFileFor(activeMutant.fileName),
      hitLimit,
      disableBail: this.options.disableBail,
    };
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }
}
