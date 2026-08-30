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

import { DryRunContext } from './3-dry-run-executor.js';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner>>;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportHelper]: MutationTestReportHelper;
  [coreTokens.mutantTestPlanner]: MutantTestPlanner;
  [coreTokens.dryRunResult]: I<CompleteDryRunResult>;
}

const CHECK_BUFFER_MS = 10_000;

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
    // Run all mutants that reuse the test environment first and the ones that need a
    // reload (static mutants) last, across the whole run rather than per buffered batch.
    // Interleaving them forces an extra environment reload on whichever mutant follows a
    // static one, which on large suites adds up to many avoidable reloads.
    const sharedPlan$ = input$.pipe(shareReplay());
    const [reloadPlan$, noReloadPlan$] = partition(
      sharedPlan$,
      ({ runOptions }) => Boolean(runOptions.reloadEnvironment),
    );
    const orderedPlan$ = concat(noReloadPlan$, reloadPlan$);
    return this.testRunnerPool.schedule(
      orderedPlan$,
      async (testRunner, { mutant, runOptions }) => {
        const result = await testRunner.mutantRun(runOptions);
        return this.mutationTestReportHelper.reportMutantRunResult(
          mutant,
          result,
        );
      },
    );
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
