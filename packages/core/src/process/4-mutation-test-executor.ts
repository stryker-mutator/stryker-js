import {
  from,
  partition,
  merge,
  Observable,
  lastValueFrom,
  EMPTY,
  concat,
  bufferTime,
  mergeMap,
  concatMap,
  of,
} from 'rxjs';
import { toArray, map, shareReplay, tap } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import {
  MutantResult,
  Mutant,
  StrykerOptions,
  PlanKind,
  MutantTestPlan,
  MutantRunPlan,
} from '@stryker-mutator/api/core';
import {
  TestRunner,
  CompleteDryRunResult,
  MutantRunStatus,
} from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';
import { CheckStatus } from '@stryker-mutator/api/check';

import { coreTokens } from '../di/index.js';
import { StrictReporter } from '../reporters/strict-reporter.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { Timer } from '../utils/timer.js';
import { ConcurrencyTokenProvider, Pool } from '../concurrent/index.js';
import { isEarlyResult, MutantTestPlanner } from '../mutants/index.js';
import { CheckerFacade } from '../checker/index.js';
import { ConfigError } from '../errors.js';
import {
  isWallClockTimeout,
  toBaselineRunOptions,
} from '../test-runner/wall-clock-timeout.js';

import { DryRunContext } from './3-dry-run-executor.js';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner>>;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportHelper]: MutationTestReportHelper;
  [coreTokens.mutantTestPlanner]: MutantTestPlanner;
  [coreTokens.dryRunResult]: I<CompleteDryRunResult>;
}

const CHECK_BUFFER_MS = 10_000;

/**
 * Sorting the tests just before running them can yield a significant performance boost,
 * because it can reduce the number of times a test runner process needs to be recreated.
 * However, we need to buffer the results in order to be able to sort them.
 *
 * This value is very low, since it would halt the test execution otherwise.
 * @see https://github.com/stryker-mutator/stryker-js/issues/3462
 */
const BUFFER_FOR_SORTING_MS = 0;

export class MutationTestExecutor {
  public static inject = tokens(
    coreTokens.reporter,
    coreTokens.testRunnerPool,
    coreTokens.checkerPool,
    coreTokens.mutants,
    coreTokens.mutantTestPlanner,
    coreTokens.mutationTestReportHelper,
    commonTokens.logger,
    commonTokens.options,
    coreTokens.timer,
    coreTokens.concurrencyTokenProvider,
    coreTokens.dryRunResult,
  );

  private readonly timeoutRecheck = { completed: 0, confirmed: 0 };

  constructor(
    private readonly reporter: StrictReporter,
    private readonly testRunnerPool: I<Pool<TestRunner>>,
    private readonly checkerPool: I<Pool<I<CheckerFacade>>>,
    private readonly mutants: readonly Mutant[],
    private readonly planner: MutantTestPlanner,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>,
    private readonly dryRunResult: CompleteDryRunResult,
  ) {}

  public async execute(): Promise<MutantResult[]> {
    if (this.options.dryRunOnly) {
      this.log.info(
        'The dry-run has been completed successfully. No mutations have been executed.',
      );
      return [];
    }

    if (this.dryRunResult.tests.length === 0 && this.options.allowEmpty) {
      this.logDone();
      return [];
    }

    const mutantTestPlans = await this.planner.makePlan(this.mutants);
    const { earlyResult$, runMutant$ } = this.executeEarlyResult(
      from(mutantTestPlans),
    );
    const { passedMutant$, checkResult$ } = this.executeCheck(runMutant$);
    const { coveredMutant$, noCoverageResult$ } =
      this.executeNoCoverage(passedMutant$);
    const testRunnerResult$ = this.executeRunInTestRunner(coveredMutant$);
    const results = await lastValueFrom(
      merge(
        testRunnerResult$,
        checkResult$,
        noCoverageResult$,
        earlyResult$,
      ).pipe(toArray()),
    );
    this.logTimeoutRecheck();
    await this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private executeEarlyResult(input$: Observable<MutantTestPlan>) {
    const [earlyResultMutants$, runMutant$] = partition(
      input$.pipe(shareReplay()),
      isEarlyResult,
    );
    const earlyResult$ = earlyResultMutants$.pipe(
      map(({ mutant }) =>
        this.mutationTestReportHelper.reportMutantStatus(mutant, mutant.status),
      ),
    );
    return { earlyResult$, runMutant$ };
  }

  private executeNoCoverage(input$: Observable<MutantRunPlan>) {
    const [noCoverageMatchedMutant$, coveredMutant$] = partition(
      input$.pipe(shareReplay()),
      ({ runOptions }) => runOptions.testFilter?.length === 0,
    );
    const noCoverageResult$ = noCoverageMatchedMutant$.pipe(
      map(({ mutant }) =>
        this.mutationTestReportHelper.reportMutantStatus(mutant, 'NoCoverage'),
      ),
    );
    return { noCoverageResult$, coveredMutant$ };
  }

  private executeRunInTestRunner(
    input$: Observable<MutantRunPlan>,
  ): Observable<MutantResult> {
    const sortedPlan$ = input$.pipe(
      bufferTime(BUFFER_FOR_SORTING_MS),
      mergeMap((plans) => plans.sort(reloadEnvironmentLast)),
    );
    const run$ = this.testRunnerPool
      .schedule(sortedPlan$, async (testRunner, plan) => ({
        plan,
        result: await testRunner.mutantRun(plan.runOptions),
      }))
      .pipe(shareReplay());
    const [wallClockTimeout$, completedRun$] = partition(
      run$,
      ({ plan, result }) => isWallClockTimeout(result, plan.runOptions.timeout),
    );
    const completedResult$ = completedRun$.pipe(
      map(({ plan, result }) =>
        this.mutationTestReportHelper.reportMutantRunResult(
          plan.mutant,
          result,
        ),
      ),
    );
    const recheckedResult$ = wallClockTimeout$.pipe(
      toArray(),
      mergeMap((runs) => runs),
      concatMap(({ plan }) =>
        this.testRunnerPool.schedule(of(plan), (testRunner, timedOutPlan) =>
          this.recheckWallClockTimeout(testRunner, timedOutPlan),
        ),
      ),
    );
    return merge(completedResult$, recheckedResult$);
  }

  private async recheckWallClockTimeout(
    testRunner: TestRunner,
    { mutant, runOptions }: MutantRunPlan,
  ): Promise<MutantResult> {
    const recheckResult = await testRunner.mutantRun(runOptions);
    if (!isWallClockTimeout(recheckResult, runOptions.timeout)) {
      this.timeoutRecheck.completed++;
      return this.mutationTestReportHelper.reportMutantRunResult(
        mutant,
        recheckResult,
      );
    }
    const baselineOptions = toBaselineRunOptions(runOptions);
    const baselineFitsTimeout = async () =>
      !isWallClockTimeout(
        await testRunner.mutantRun(baselineOptions),
        runOptions.timeout,
      );
    if (!(await baselineFitsTimeout()) && !(await baselineFitsTimeout())) {
      throw new ConfigError(
        `Tests exceed the timeout of ${runOptions.timeout} ms even without an active mutant, so timeouts cannot be attributed to mutants. Increase \`timeoutMS\` or \`timeoutFactor\` to fix this.`,
      );
    }
    this.timeoutRecheck.confirmed++;
    return this.mutationTestReportHelper.reportMutantRunResult(mutant, {
      status: MutantRunStatus.Timeout,
      reason: `Timeout of ${runOptions.timeout} ms expired on a re-check, while the same tests completed in time without the mutant`,
    });
  }

  private logTimeoutRecheck() {
    const { completed, confirmed } = this.timeoutRecheck;
    if (completed + confirmed > 0) {
      this.log.info(
        'Re-checked %s wall-clock timeout(s) one at a time: %s completed in time, %s confirmed as timeout.',
        completed + confirmed,
        completed,
        confirmed,
      );
    }
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }

  /**
   * Checks mutants against all configured checkers (if any) and returns steams for failed checks and passed checks respectively
   * @param input$ The mutant run plans to check
   */
  public executeCheck(input$: Observable<MutantRunPlan>): {
    checkResult$: Observable<MutantResult>;
    passedMutant$: Observable<MutantRunPlan>;
  } {
    let checkResult$: Observable<MutantResult> = EMPTY;
    let passedMutant$ = input$;
    for (const checkerName of this.options.checkers) {
      // Use this checker
      const [checkFailedResult$, checkPassedResult$] = partition(
        this.executeSingleChecker(checkerName, passedMutant$).pipe(
          shareReplay(),
        ),
        isEarlyResult,
      );

      // Prepare for the next one
      passedMutant$ = checkPassedResult$;
      checkResult$ = concat(
        checkResult$,
        checkFailedResult$.pipe(map(({ mutant }) => mutant)),
      );
    }
    return {
      checkResult$,
      passedMutant$: passedMutant$.pipe(
        tap({
          complete: () => {
            this.checkerPool
              .dispose()
              .then(() => {
                this.concurrencyTokenProvider.freeCheckers();
              })
              .catch((error) => {
                this.log.error(
                  'An error occurred while disposing checkers: %s',
                  error,
                );
              });
          },
        }),
      ),
    };
  }

  /**
   * Executes the check task for one checker
   * @param checkerName The name of the checker to execute
   * @param input$ The mutants tasks to check
   * @returns An observable stream with early results (check failed) and passed results
   */
  private executeSingleChecker(
    checkerName: string,
    input$: Observable<MutantRunPlan>,
  ): Observable<MutantTestPlan> {
    const group$ = this.checkerPool
      .schedule(input$.pipe(bufferTime(CHECK_BUFFER_MS)), (checker, mutants) =>
        checker.group(checkerName, mutants),
      )
      .pipe(mergeMap((mutantGroups) => mutantGroups));
    const checkTask$ = this.checkerPool
      .schedule(group$, (checker, group) => checker.check(checkerName, group))
      .pipe(
        mergeMap((mutantGroupResults) => mutantGroupResults),
        map(([mutantRunPlan, checkResult]) =>
          checkResult.status === CheckStatus.Passed
            ? mutantRunPlan
            : {
                plan: PlanKind.EarlyResult as const,
                mutant: this.mutationTestReportHelper.reportCheckFailed(
                  mutantRunPlan.mutant,
                  checkResult,
                ),
              },
        ),
      );
    return checkTask$;
  }
}

/**
 * Sorting function that sorts mutant run plans that reload environments last.
 * This can yield a significant performance boost, because it reduces the times a test runner process needs to restart.
 * @see https://github.com/stryker-mutator/stryker-js/issues/3462
 */
function reloadEnvironmentLast(a: MutantRunPlan, b: MutantRunPlan): number {
  if (a.plan === PlanKind.Run && b.plan === PlanKind.Run) {
    if (a.runOptions.reloadEnvironment && !b.runOptions.reloadEnvironment) {
      return 1;
    }
    if (!a.runOptions.reloadEnvironment && b.runOptions.reloadEnvironment) {
      return -1;
    }
    return 0;
  }
  return 0;
}
