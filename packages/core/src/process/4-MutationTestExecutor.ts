import { from } from 'rxjs';
import { zip, flatMap, toArray } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import { CompleteDryRunResult, MutantRunOptions, TestRunner2, MutantRunStatus } from '@stryker-mutator/api/test_runner2';
import { Logger } from '@stryker-mutator/api/logging';
import { I } from '@stryker-mutator/util';

import { coreTokens } from '../di';
import StrictReporter from '../reporters/StrictReporter';
import { TestRunnerPool } from '../test-runner-2';
import { MutantTestCoverage } from '../mutants/MutantTestMatcher2';
import { MutationTestReportCalculator } from '../reporters/MutationTestReportCalculator';
import Timer from '../utils/Timer';

import { DryRunContext } from './3-DryRunExecutor';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: TestRunnerPool;
  [coreTokens.dryRunResult]: CompleteDryRunResult;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportCalculator]: MutationTestReportCalculator;
  [coreTokens.mutantsWithTestCoverage]: MutantTestCoverage[];
}

export class MutationTestExecutor {
  public static inject = tokens(
    commonTokens.options,
    coreTokens.reporter,
    coreTokens.testRunnerPool,
    coreTokens.timeOverheadMS,
    coreTokens.mutantsWithTestCoverage,
    coreTokens.mutationTestReportCalculator,
    commonTokens.logger,
    coreTokens.timer
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly reporter: StrictReporter,
    private readonly testRunnerPool: I<TestRunnerPool>,
    private readonly timeOverheadMS: number,
    private readonly matchedMutants: readonly MutantTestCoverage[],
    private readonly mutationTestReportCalculator: I<MutationTestReportCalculator>,
    private readonly log: Logger,
    private readonly timer: I<Timer>
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const results = await this.testRunnerPool.testRunner$.pipe(zip(from(this.matchedMutants)), flatMap(this.runInTestRunner), toArray()).toPromise();

    this.mutationTestReportCalculator.reportAll(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private createMutantRunOptions(mutant: MutantTestCoverage): MutantRunOptions {
    return {
      activeMutant: mutant.mutant,
      timeout: this.calculateTimeout(mutant),
      testFilter: mutant.testFilter,
    };
  }

  private calculateTimeout(mutant: MutantTestCoverage) {
    return this.options.timeoutFactor * mutant.estimatedNetTime + this.options.timeoutMS + this.timeOverheadMS;
  }

  private readonly runInTestRunner = async ([testRunner, matchedMutant]: [Required<TestRunner2>, MutantTestCoverage]): Promise<MutantResult> => {
    let mutantResult: MutantResult;
    if (matchedMutant.coveredByTests) {
      const mutantRunOptions = this.createMutantRunOptions(matchedMutant);
      const result = await testRunner.mutantRun(mutantRunOptions);
      mutantResult = this.mutationTestReportCalculator.reportOne(matchedMutant, this.toResultStatus(result.status));
    } else {
      mutantResult = this.mutationTestReportCalculator.reportOne(matchedMutant, MutantStatus.NoCoverage);
    }
    this.testRunnerPool.recycle(testRunner);
    return mutantResult;
  };

  private toResultStatus(mutantRunStatus: MutantRunStatus): MutantStatus {
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
