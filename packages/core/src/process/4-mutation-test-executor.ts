import { from, partition, merge, Observable, lastValueFrom } from 'rxjs';
import { toArray, map, tap, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { MutantResult, MutantStatus, Mutant } from '@stryker-mutator/api/core';
import { TestRunner } from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';
import { CheckStatus, Checker, CheckResult, PassedCheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper';
import { Timer } from '../utils/timer';
import { Pool, ConcurrencyTokenProvider } from '../concurrent';
import { MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan, MutantTestPlanner, PlanKind } from '../mutants';

import { DryRunContext } from './3-dry-run-executor';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner>>;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportHelper]: MutationTestReportHelper;
  [coreTokens.mutantTestPlanner]: MutantTestPlanner;
}

export class MutationTestExecutor {
  public static inject = tokens(
    coreTokens.reporter,
    coreTokens.checkerPool,
    coreTokens.testRunnerPool,
    coreTokens.mutants,
    coreTokens.mutantTestPlanner,
    coreTokens.mutationTestReportHelper,
    commonTokens.logger,
    coreTokens.timer,
    coreTokens.concurrencyTokenProvider
  );

  constructor(
    private readonly reporter: StrictReporter,
    private readonly checkerPool: I<Pool<Checker>>,
    private readonly testRunnerPool: I<Pool<TestRunner>>,
    private readonly mutants: readonly Mutant[],
    private readonly planner: MutantTestPlanner,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly log: Logger,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const mutantTestPlans = this.planner.makePlan(this.mutants);
    const { ignoredResult$, notIgnoredMutant$ } = this.executeEarlyResult(from(mutantTestPlans));
    const { passedMutant$, checkResult$ } = this.executeCheck(from(notIgnoredMutant$));
    const { coveredMutant$, noCoverageResult$ } = this.executeNoCoverage(passedMutant$);
    const testRunnerResult$ = this.executeRunInTestRunner(coveredMutant$);
    const results = await lastValueFrom(merge(testRunnerResult$, checkResult$, noCoverageResult$, ignoredResult$).pipe(toArray()));
    this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private executeEarlyResult(input$: Observable<MutantTestPlan>) {
    const [ignoredMutant$, notIgnoredMutant$] = partition(input$.pipe(shareReplay()), isEarlyResult);
    const ignoredResult$ = ignoredMutant$.pipe(map(({ mutant }) => this.mutationTestReportHelper.reportMutantStatus(mutant, MutantStatus.Ignored)));
    return { ignoredResult$, notIgnoredMutant$ };
  }

  private executeNoCoverage(input$: Observable<MutantRunPlan>) {
    const [noCoverageMatchedMutant$, coveredMutant$] = partition(input$.pipe(shareReplay()), ({ runOptions }) => runOptions.testFilter?.length === 0);
    const noCoverageResult$ = noCoverageMatchedMutant$.pipe(
      map(({ mutant }) => this.mutationTestReportHelper.reportMutantStatus(mutant, MutantStatus.NoCoverage))
    );
    return { noCoverageResult$, coveredMutant$ };
  }

  private executeCheck(input$: Observable<MutantRunPlan>): { checkResult$: Observable<MutantResult>; passedMutant$: Observable<MutantRunPlan> } {
    const checkTask$ = this.checkerPool
      .schedule(input$, async (checker, { mutant, runOptions }) => {
        const checkResult = await checker.check(mutant);
        return {
          checkResult,
          mutant,
          runOptions,
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
    const passedMutant$ = passedCheckResult$.pipe(map(({ mutant, runOptions }) => ({ mutant, runOptions, plan: PlanKind.Run as const })));
    return { checkResult$, passedMutant$ };
  }

  private executeRunInTestRunner(input$: Observable<MutantRunPlan>): Observable<MutantResult> {
    return this.testRunnerPool.schedule(input$, async (testRunner, { mutant, runOptions }) => {
      const result = await testRunner.mutantRun(runOptions);
      return this.mutationTestReportHelper.reportMutantRunResult(mutant, result);
    });
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }
}

function isEarlyResult(mutantPlan: MutantTestPlan): mutantPlan is MutantEarlyResultPlan {
  return mutantPlan.mutant.status !== undefined;
}
