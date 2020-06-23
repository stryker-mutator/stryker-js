import { from } from 'rxjs';
import { zip, flatMap, tap, toArray } from 'rxjs/operators';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import { CompleteDryRunResult, MutantRunOptions, TestRunner2, MutantRunStatus } from '@stryker-mutator/api/test_runner2';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';
import StrictReporter from '../reporters/StrictReporter';
import { TestRunnerPool } from '../test-runner-2';
import { mutatedLines, originalLines } from '../utils/mutantUtils';
import InputFileCollection from '../input/InputFileCollection';
import { matchMutantsWithTests, MatchedMutant } from '../mutants/MutantTestMatcher2';
import { MutationTestReportCalculator } from '../reporters/MutationTestReportCalculator';
import Timer from '../utils/Timer';

import { DryRunContext } from './3-DryRunExecutor';

export interface MutationTestContext extends DryRunContext {
  [coreTokens.testRunnerPool]: TestRunnerPool;
  [coreTokens.dryRunResult]: CompleteDryRunResult;
  [coreTokens.timeOverheadMS]: number;
  [coreTokens.mutationTestReportCalculator]: MutationTestReportCalculator;
}

export class MutationTestExecutor {
  public static inject = tokens(
    commonTokens.options,
    coreTokens.reporter,
    coreTokens.testRunnerPool,
    coreTokens.dryRunResult,
    coreTokens.inputFiles,
    coreTokens.timeOverheadMS,
    coreTokens.mutants,
    coreTokens.mutationTestReportCalculator,
    commonTokens.logger,
    coreTokens.timer
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly reporter: StrictReporter,
    private readonly testRunnerPool: TestRunnerPool,
    private readonly dryRunResult: CompleteDryRunResult,
    private readonly inputFileCollection: InputFileCollection,
    private readonly timeOverheadMS: number,
    private readonly allMutants: readonly Mutant[],
    private readonly mutationTestReportCalculator: MutationTestReportCalculator,
    private readonly log: Logger,
    private readonly timer: Timer
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const matchedMutants = matchMutantsWithTests(this.dryRunResult, this.allMutants);
    const results = await this.testRunnerPool.testRunner$
      .pipe(zip(from(matchedMutants)), flatMap(this.runInTestRunner), tap(this.reportResult), toArray(), tap(this.reportAll))
      .toPromise();

    this.mutationTestReportCalculator.report(results);
    await this.reporter.wrapUp();
    this.logDone();
    return results;
  }

  private createMutantRunOptions(mutant: MatchedMutant): MutantRunOptions {
    return {
      activeMutant: mutant.mutant,
      timeout: this.calculateTimeout(mutant),
      testFilter: mutant.testFilter,
    };
  }

  private calculateTimeout(mutant: MatchedMutant) {
    return this.options.timeoutFactor * mutant.estimatedNetTime + this.options.timeoutMS + this.timeOverheadMS;
  }

  private readonly runInTestRunner = async ([testRunner, matchedMutant]: [Required<TestRunner2>, MatchedMutant]): Promise<MutantResult> => {
    const { mutant } = matchedMutant;
    const originalFileTextContent = this.inputFileCollection.filesToMutate.find((fileToMutate) => fileToMutate.name === mutant.fileName)!.textContent;
    const allTestNames = this.dryRunResult.tests.map((t) => t.name);
    const mutantResult: MutantResult = {
      id: mutant.id.toString(),
      location: mutant.location,
      mutatedLines: mutatedLines(originalFileTextContent, mutant),
      mutatorName: mutant.mutatorName,
      originalLines: originalLines(originalFileTextContent, mutant),
      range: mutant.range,
      replacement: mutant.replacement,
      sourceFilePath: mutant.fileName,
      status: MutantStatus.NoCoverage,
      testsRan: [],
    };
    if (matchedMutant.coveredByTests) {
      const mutantRunOptions = this.createMutantRunOptions(matchedMutant);
      const result = await testRunner.mutantRun(mutantRunOptions);
      const { testFilter } = mutantRunOptions;
      mutantResult.testsRan = testFilter ? this.dryRunResult.tests.filter((t) => testFilter.includes(t.id)).map((t) => t.name) : allTestNames;
      mutantResult.status = this.toResultStatus(result.status);
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

  private readonly reportResult = (mutantResult: MutantResult): void => {
    this.reporter.onMutantTested(mutantResult);
  };

  private readonly reportAll = (mutantResults: MutantResult[]): void => {
    this.reporter.onAllMutantsTested(mutantResults);
  };

  private logDone() {
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
  }
}
