import { MutantResult, MutantTestCoverage, StrykerOptions } from "@stryker-mutator/api/core";
import { I } from "@stryker-mutator/util";
import { EMPTY, firstValueFrom, from, lastValueFrom, merge, Observable, of, Subject, toArray } from "rxjs";
import { CheckerResource, ConcurrencyTokenProvider, Pool } from "../concurrent";
import { Logger } from '@stryker-mutator/api/logging';
import { CheckStatus } from "@stryker-mutator/api/check";
import { MutationTestReportHelper } from "../reporters/mutation-test-report-helper";
import { coreTokens } from '../di';
import { tokens, commonTokens } from "@stryker-mutator/api/plugin";

export class CheckerFacade {
  public static inject = tokens(
    commonTokens.options,
    coreTokens.checkerPool,
    commonTokens.logger,
    coreTokens.concurrencyTokenProvider,
    coreTokens.mutationTestReportHelper,
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly checkerPool: I<Pool<CheckerResource>>,
    private readonly log: Logger,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>
  ) { }

  public executeCheck(input$: Observable<MutantTestCoverage>) {
    if (!this.options.checkers.length) {
      return {
        checkResult$: EMPTY,
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

    this.log.debug(`${checkerType} created ${groups.length} groups.`);

    const run$ = this.checkerPool.schedule(from(groups), async (checker, mutantGroup) => {
      const results = await checker.check(mutantGroup);
      results.forEach((result) => {
        if (result.checkResult.status === CheckStatus.Passed) {
          passedMutant$.next(result.mutant);
        } else {
          checkResult$.next(this.mutationTestReportHelper.reportCheckFailed(result.mutant, result.checkResult));
        }
      });
    });

    await lastValueFrom(run$);
    passedMutant$.complete();
  }
}