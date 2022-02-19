import { from, partition, merge, Observable, lastValueFrom } from 'rxjs';
import { toArray, map, shareReplay } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { MutantResult, MutantStatus, Mutant } from '@stryker-mutator/api/core';
import { TestRunner } from '@stryker-mutator/api/test-runner';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { StrictReporter } from '../reporters/strict-reporter.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { Timer } from '../utils/timer.js';
import { Pool } from '../concurrent/index.js';
import { MutantEarlyResultPlan, MutantRunPlan, MutantTestPlan, MutantTestPlanner } from '../mutants/index.js';

import { CheckerFacade } from '../checker/checker-facade.js';

import { DryRunContext } from './3-dry-run-executor.js';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: I<Pool<TestRunner>>;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportHelper]: MutationTestReportHelper;
  [coreTokens.mutantTestPlanner]: MutantTestPlanner;
  [coreTokens.checkerFacade]: CheckerFacade;
}

export class MutationTestExecutor {
  public static inject = tokens(
    coreTokens.reporter,
    coreTokens.testRunnerPool,
    coreTokens.mutants,
    coreTokens.mutantTestPlanner,
    coreTokens.mutationTestReportHelper,
    commonTokens.logger,
    coreTokens.timer,
    coreTokens.checkerFacade
  );

  constructor(
    private readonly reporter: StrictReporter,
    private readonly testRunnerPool: I<Pool<TestRunner>>,
    private readonly mutants: readonly Mutant[],
    private readonly planner: MutantTestPlanner,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly log: Logger,
    private readonly timer: I<Timer>,
    private readonly checkerFacade: CheckerFacade
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const mutantTestPlans = this.planner.makePlan(this.mutants);
    const { ignoredResult$, notIgnoredMutant$ } = this.executeEarlyResult(from(mutantTestPlans));
    const { passedMutant$, checkResult$ } = this.checkerFacade.executeCheck(notIgnoredMutant$);
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
