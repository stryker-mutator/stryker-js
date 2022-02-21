import { MutantResult, StrykerOptions } from '@stryker-mutator/api/core';
import { I } from '@stryker-mutator/util';
import { EMPTY, firstValueFrom, from, lastValueFrom, merge, Observable, of, Subject, toArray } from 'rxjs';
import { Logger } from '@stryker-mutator/api/logging';
import { CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { ConcurrencyTokenProvider, Pool } from '../concurrent/index.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { coreTokens } from '../di/index.js';

import { MutantRunPlan } from '../mutants/index.js';

import { CheckerResource } from './checker-resource.js';

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
    if (!this.options.checkers.length) {
      return {
        checkResult$: EMPTY,
        passedMutant$: input$,
      };
    }

    const checkResult$ = new Subject<MutantResult>();
    let previousPassedMutants$ = input$;

    for (let i = 0; i < this.options.checkers.length; i++) {
      const passedMutants$ = new Subject<MutantRunPlan>();
      this.executeChecker(i, previousPassedMutants$, checkResult$, passedMutants$);
      previousPassedMutants$ = passedMutants$;
    }

    previousPassedMutants$.subscribe({
      complete: () => {
        this.log.debug('Checker(s) finished.');

        checkResult$.complete();

        this.checkerPool.dispose();
        this.concurrencyTokenProvider.freeCheckers();
      },
    });

    return {
      checkResult$: checkResult$.asObservable(),
      passedMutant$: previousPassedMutants$,
    };
  }

  private async executeChecker(
    checkerIndex: number,
    previousPassedMutants$: Observable<MutantRunPlan>,
    checkResult$: Subject<MutantResult>,
    passedMutant$: Subject<MutantRunPlan>
  ) {
    const mutants = await lastValueFrom(merge(previousPassedMutants$).pipe(toArray()));

    const groups = await firstValueFrom(
      this.checkerPool.schedule(of(0), async (checker) => {
        const mutantArray = mutants.map((m) => m.mutant);
        const group = await checker.createGroups?.(checkerIndex, mutantArray);

        return group ?? mutants.map((m) => [m.mutant]);
      })
    );

    this.log.debug(`${this.options.checkers[checkerIndex]} created ${groups.length} groups.`);

    const run$ = this.checkerPool.schedule(from(groups), async (checker, mutantGroup) => {
      const results = await checker.check(checkerIndex, mutantGroup);
      Object.entries(results).forEach(([id, result]) => {

        /**
         * TODO: It searches in the whole mutant array. It should only search in the mutant group.
         */
        const mutant = mutants.find((m) => m.mutant.id === id)!;

        if (result.status === CheckStatus.Passed) passedMutant$.next(mutant);
        else checkResult$.next(this.mutationTestReportHelper.reportCheckFailed(mutant.mutant, result));
      });
    });

    await lastValueFrom(run$);
    passedMutant$.complete();
  }
}
