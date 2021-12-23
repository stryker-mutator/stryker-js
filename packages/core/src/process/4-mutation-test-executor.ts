import { from, partition, merge, Observable, lastValueFrom, of, firstValueFrom, Subject } from 'rxjs';
import { toArray, map, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { MutantTestCoverage, MutantResult, StrykerOptions, MutantStatus } from '@stryker-mutator/api/core';
import { MutantRunOptions, TestRunner } from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';
import { CheckStatus } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper';
import { Timer } from '../utils/timer';
import { Pool, ConcurrencyTokenProvider, CheckerResource } from '../concurrent';
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
    private readonly checkerPool: I<Pool<CheckerResource>>,
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
    const { passedMutant$, checkResult$ } = this.executeCheck(notIgnoredMutant$);
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
    if (!this.options.checkers.length) {
      const checkResult$ = new Subject<MutantResult>();
      checkResult$.complete();
      return {
        checkResult$: checkResult$.asObservable(),
        passedMutant$: input$,
      };
    }

    const checkResult$ = new Subject<MutantResult>();
    let previousPassedMutants$ = input$;

    for (const checkerType of this.options.checkers) {
      const passedMutants$ = new Subject<MutantTestCoverage>();
      this.executeChecker(checkerType, previousPassedMutants$, checkResult$, passedMutants$);
      previousPassedMutants$ = passedMutants$;
    }

    lastValueFrom(checkResult$).then(() => {
      this.log.debug('Checker(s) finished.');

      if (previousPassedMutants$ instanceof Subject) {
        previousPassedMutants$.complete();
      }

      this.checkerPool.dispose();
      this.concurrencyTokenProvider.freeCheckers();
    });

    return {
      checkResult$: checkResult$.asObservable(),
      passedMutant$: previousPassedMutants$,
    };
  }

  private async executeChecker(
    checkerType: string,
    previousPassedMutants$: Observable<MutantTestCoverage>,
    checkResult$: Subject<MutantResult>,
    passedMutant$: Subject<MutantTestCoverage>
  ) {
    const mutants = await lastValueFrom(merge(previousPassedMutants$).pipe(toArray()));

    // Set the active checker on all checkerWorkers
    await this.checkerPool.runOnAllResources(async (checkerResource) => {
      await checkerResource.setActiveChecker(checkerType);
    });

    const groups = await firstValueFrom(
      this.checkerPool.schedule(of(0), async (checker) => {
        const group = await checker.createGroups?.(mutants);
        return group ?? mutants.map((m) => [m]);
      })
    );

    const run = this.checkerPool.schedule(from(groups), async (checker, mutantGroup) => {
      const results = await checker.check(mutantGroup);
      results.forEach((result) => {
        if (result.checkResult.status === CheckStatus.Passed) {
          passedMutant$.next(result.mutant);
        } else {
          checkResult$.next(this.mutationTestReportHelper.reportCheckFailed(result.mutant, result.checkResult));
        }
      });
    });

    await lastValueFrom(run);
    checkResult$.complete();
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
