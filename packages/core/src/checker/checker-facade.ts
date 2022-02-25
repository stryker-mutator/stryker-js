import { MutantResult, StrykerOptions } from '@stryker-mutator/api/core';
import { I } from '@stryker-mutator/util';
import { bufferTime, EMPTY, mergeMap, Observable, partition, shareReplay, map, tap, concat } from 'rxjs';
import { Logger } from '@stryker-mutator/api/logging';
import { CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { ConcurrencyTokenProvider, Pool } from '../concurrent/index.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { coreTokens } from '../di/index.js';
import { MutantRunPlan, PlanKind } from '../mutants/index.js';

import { CheckerResource } from './checker-resource.js';

const CHECK_BUFFER_MS = 10_000;

export class CheckerFacade {
  public static inject = tokens(
    commonTokens.options,
    coreTokens.checkerPool,
    commonTokens.logger,
    coreTokens.concurrencyTokenProvider,
    coreTokens.mutationTestReportHelper
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly checkerPool: I<Pool<CheckerResource>>,
    private readonly log: Logger,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>
  ) {}

  public executeCheck(input$: Observable<MutantRunPlan>): {
    checkResult$: Observable<MutantResult>;
    passedMutant$: Observable<MutantRunPlan>;
  } {
    let checkResult$: Observable<MutantResult> = EMPTY;
    let passedMutant$ = input$;
    for (const checkerName of this.options.checkers) {
      // Use this checker
      const { failedCheckResult$, passedCheckResult$ } = this.executeChecker(checkerName, passedMutant$);

      // Prepare for the next one
      passedMutant$ = passedCheckResult$;
      checkResult$ = concat(
        checkResult$,
        failedCheckResult$.pipe(map((failedMutant) => this.mutationTestReportHelper.reportCheckFailed(failedMutant.mutant, failedMutant.checkResult)))
      );
    }
    return {
      checkResult$,
      passedMutant$: passedMutant$.pipe(
        tap({
          complete: () => {
            this.checkerPool.dispose();
            this.concurrencyTokenProvider.freeCheckers();
          },
        })
      ),
    };
  }

  private executeChecker(checkerName: string, input$: Observable<MutantRunPlan>) {
    const group$ = this.checkerPool
      .schedule(input$.pipe(bufferTime(CHECK_BUFFER_MS)), async (checker, mutants) => {
        const groupedMutantIds = await checker.group(
          checkerName,
          mutants.map(({ mutant }) => mutant)
        );
        this.log.debug('Checker %s created %s groups (based on %s mutants).', checkerName, groupedMutantIds.length, mutants.length);
        return groupedMutantIds.map((mutantIdGroup) => mutantIdGroup.map((mutantId) => mutants.find(({ mutant }) => mutant.id === mutantId)!));
      })
      .pipe(mergeMap((mutantGroups) => mutantGroups));
    const checkTask$ = this.checkerPool
      .schedule(group$, async (checker, group) => {
        const checkResults = await checker.check(
          checkerName,
          group.map(({ mutant }) => mutant)
        );
        return group.map((mutantPlan) => {
          const checkResult = checkResults[mutantPlan.mutant.id];
          if (checkResult.status === CheckStatus.Passed) {
            return mutantPlan;
          } else {
            return {
              plan: PlanKind.EarlyResult as const,
              mutant: mutantPlan.mutant,
              checkResult,
            };
          }
        });
      })
      .pipe(
        mergeMap((mutantGroupResults) => mutantGroupResults),
        shareReplay()
      );
    const [passedCheckResult$, failedCheckResult$] = partition(checkTask$, (item): item is MutantRunPlan => item.plan === PlanKind.Run);
    return { passedCheckResult$, failedCheckResult$ };
  }
}
