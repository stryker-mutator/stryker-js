import { from, zip, partition, merge, Observable } from 'rxjs';
import { flatMap, toArray, map, tap, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import { MutantRunOptions, MutantRunStatus, TestRunner2 } from '@stryker-mutator/api/test_runner2';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';

import { CheckStatus, Checker } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import StrictReporter from '../reporters/StrictReporter';
import { MutantTestCoverage } from '../mutants/findMutantTestCoverage';
import { MutationTestReportHelper } from '../reporters/MutationTestReportHelper';
import Timer from '../utils/Timer';

import { Pool, ConcurrencyTokenProvider } from '../concurrent';

import { Sandbox } from '../sandbox';

import { DryRunContext } from './3-DryRunExecutor';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner2>>;
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
    private readonly testRunnerPool: I<Pool<TestRunner2>>,
    private readonly timeOverheadMS: number,
    private readonly matchedMutants: readonly MutantTestCoverage[],
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly sandbox: I<Sandbox>,
    private readonly log: Logger,
    private readonly timer: I<Timer>,
    private readonly concurrencyTokenProvider: I<ConcurrencyTokenProvider>
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const { passedMutant$, checkResult$ } = this.executeCheck(from(this.matchedMutants));
    const { coveredMutant$, noCoverageResult$ } = this.executeNoCoverage(passedMutant$);
    const testRunnerResult$ = this.executeRunInTestRunner(coveredMutant$);
    const results = await merge(testRunnerResult$, checkResult$, noCoverageResult$).pipe(toArray()).toPromise();
    this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private executeNoCoverage(input$: Observable<MutantTestCoverage>) {
    const [coveredMutant$, noCoverageMatchedMutant$] = partition(input$.pipe(shareReplay()), (matchedMutant) => matchedMutant.coveredByTests);
    return {
      noCoverageResult$: noCoverageMatchedMutant$.pipe(
        map((noCoverage) => this.mutationTestReportHelper.reportOne(noCoverage, MutantStatus.NoCoverage))
      ),
      coveredMutant$,
    };
  }

  private executeCheck(input$: Observable<MutantTestCoverage>) {
    const checkTask$ = zip(input$, this.checkerPool.worker$).pipe(
      flatMap(async ([matchedMutant, checker]) => {
        const checkResult = await checker.check(matchedMutant.mutant);
        this.checkerPool.recycle(checker);
        return {
          checkResult,
          matchedMutant,
        };
      }),
      // Dispose when all checks are completed.
      // This will allow resources to be freed up and more test runners to be spined up.
      tap({
        complete: () => {
          this.checkerPool.dispose();
          this.concurrencyTokenProvider.freeCheckers();
        },
      })
    );
    const [passedMutant$, failedMutant$] = partition(checkTask$.pipe(shareReplay()), ({ checkResult }) => {
      return checkResult.status === CheckStatus.Passed;
    });
    return {
      checkResult$: failedMutant$.pipe(
        map((failedMutant) =>
          this.mutationTestReportHelper.reportOne(
            failedMutant.matchedMutant,
            this.checkStatusToResultStatus(failedMutant.checkResult.status as Exclude<CheckStatus, CheckStatus.Passed>)
          )
        )
      ),
      passedMutant$: passedMutant$.pipe(map(({ matchedMutant }) => matchedMutant)),
    };
  }

  private createMutantRunOptions(mutant: MutantTestCoverage): MutantRunOptions {
    return {
      activeMutant: mutant.mutant,
      timeout: this.calculateTimeout(mutant),
      testFilter: mutant.testFilter,
      sandboxFileName: this.sandbox.sandboxFileFor(mutant.mutant.fileName),
    };
  }

  private calculateTimeout(mutant: MutantTestCoverage) {
    return this.options.timeoutFactor * mutant.estimatedNetTime + this.options.timeoutMS + this.timeOverheadMS;
  }

  private executeRunInTestRunner(input$: Observable<MutantTestCoverage>): Observable<MutantResult> {
    return zip(this.testRunnerPool.worker$, input$).pipe(
      flatMap(async ([testRunner, matchedMutant]) => {
        const mutantRunOptions = this.createMutantRunOptions(matchedMutant);
        const result = await testRunner.mutantRun(mutantRunOptions);
        this.testRunnerPool.recycle(testRunner);
        return this.mutationTestReportHelper.reportOne(matchedMutant, this.mutantRunStatusToResultStatus(result.status));
      })
    );
  }

  private checkStatusToResultStatus(status: Exclude<CheckStatus, CheckStatus.Passed>): MutantStatus {
    switch (status) {
      case CheckStatus.CompileError:
        return MutantStatus.TranspileError;
    }
  }

  private mutantRunStatusToResultStatus(mutantRunStatus: MutantRunStatus): MutantStatus {
    switch (mutantRunStatus) {
      case MutantRunStatus.Error:
        return MutantStatus.RuntimeError;
      case MutantRunStatus.Killed:
        return MutantStatus.Killed;
      case MutantRunStatus.Survived:
        return MutantStatus.Survived;
      case MutantRunStatus.Timeout:
        return MutantStatus.TimedOut;
    }
  }

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }
}
