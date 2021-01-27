import { from, partition, merge, Observable } from 'rxjs';
import { toArray, map, tap, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult } from '@stryker-mutator/api/report';
import { MutantRunOptions, TestRunner } from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';
import { CheckStatus, Checker, CheckResult, PassedCheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';
import { MutantTestCoverage } from '../mutants/find-mutant-test-coverage';
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
    const results = await merge(testRunnerResult$, checkResult$, noCoverageResult$, ignoredResult$).pipe(toArray()).toPromise();
    this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private executeIgnore(input$: Observable<MutantTestCoverage>) {
    const [notIgnoredMutant$, ignoredMutant$] = partition(input$.pipe(shareReplay()), ({ mutant }) => mutant.ignoreReason === undefined);
    const ignoredResult$ = ignoredMutant$.pipe(map(({ mutant }) => this.mutationTestReportHelper.reportMutantIgnored(mutant)));
    return { ignoredResult$, notIgnoredMutant$ };
  }

  private executeNoCoverage(input$: Observable<MutantTestCoverage>) {
    const [coveredMutant$, noCoverageMatchedMutant$] = partition(input$.pipe(shareReplay()), (matchedMutant) => matchedMutant.coveredByTests);
    const noCoverageResult$ = noCoverageMatchedMutant$.pipe(map(({ mutant }) => this.mutationTestReportHelper.reportNoCoverage(mutant)));
    return { noCoverageResult$, coveredMutant$ };
  }

  private executeCheck(input$: Observable<MutantTestCoverage>) {
    const checkTask$ = this.checkerPool
      .schedule(input$, async (checker, mutant) => {
        const checkResult = await checker.check(mutant.mutant);
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
        this.mutationTestReportHelper.reportCheckFailed(
          failedMutant.mutant.mutant,
          failedMutant.checkResult as Exclude<CheckResult, PassedCheckResult>
        )
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

  private createMutantRunOptions(mutant: MutantTestCoverage): MutantRunOptions {
    const timeout = this.options.timeoutFactor * mutant.estimatedNetTime + this.options.timeoutMS + this.timeOverheadMS;
    return {
      activeMutant: mutant.mutant,
      timeout: timeout,
      testFilter: mutant.testFilter,
      sandboxFileName: this.sandbox.sandboxFileFor(mutant.mutant.fileName),
    };
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }
}
