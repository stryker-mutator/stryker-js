import path from 'path';

import { Location, Position, StrykerOptions, Mutant, MutantTestCoverage, MutantResult, schema, MutantStatus } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { calculateMutationTestMetrics, MutationTestMetricsResult } from 'mutation-testing-metrics';
import { CompleteDryRunResult, MutantRunResult, MutantRunStatus, TestResult } from '@stryker-mutator/api/test-runner';
import { CheckStatus, PassedCheckResult, CheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { InputFileCollection } from '../input/input-file-collection';
import { setExitCode } from '../utils/object-utils';

/**
 * A helper class to convert and report mutants that survived or get killed
 */
export class MutationTestReportHelper {
  public static inject = tokens(coreTokens.reporter, commonTokens.options, coreTokens.inputFiles, commonTokens.logger, coreTokens.dryRunResult);

  constructor(
    private readonly reporter: Required<Reporter>,
    private readonly options: StrykerOptions,
    private readonly inputFiles: InputFileCollection,
    private readonly log: Logger,
    private readonly dryRunResult: CompleteDryRunResult
  ) {}

  public reportCheckFailed(mutant: Mutant, checkResult: Exclude<CheckResult, PassedCheckResult>): MutantResult {
    return this.reportOne({
      ...mutant,
      status: this.checkStatusToResultStatus(checkResult.status),
      statusReason: checkResult.reason,
    });
  }

  public reportMutantStatus(mutant: MutantTestCoverage, status: MutantStatus): MutantResult {
    return this.reportOne({
      ...mutant,
      status,
    });
  }

  public reportMutantRunResult(mutant: MutantTestCoverage, result: MutantRunResult): MutantResult {
    switch (result.status) {
      case MutantRunStatus.Error:
        return this.reportOne({
          ...mutant,
          status: MutantStatus.RuntimeError,
          statusReason: result.errorMessage,
        });
      case MutantRunStatus.Killed:
        return this.reportOne({
          ...mutant,
          status: MutantStatus.Killed,
          testsCompleted: result.nrOfTests,
          killedBy: [result.killedBy],
          statusReason: result.failureMessage,
        });
      case MutantRunStatus.Timeout:
        return this.reportOne({
          ...mutant,
          status: MutantStatus.Timeout,
        });
      case MutantRunStatus.Survived:
        return this.reportOne({
          ...mutant,
          status: MutantStatus.Survived,
          testsCompleted: result.nrOfTests,
        });
    }
  }

  private reportOne(result: MutantResult): MutantResult {
    this.reporter.onMutantTested(result);
    return result;
  }

  private checkStatusToResultStatus(status: Exclude<CheckStatus, CheckStatus.Passed>): MutantStatus {
    switch (status) {
      case CheckStatus.CompileError:
        return MutantStatus.CompileError;
    }
  }

  public reportAll(results: MutantResult[]): void {
    const report = this.mutationTestReport(results);
    const metrics = calculateMutationTestMetrics(report);
    this.reporter.onAllMutantsTested(results);
    this.reporter.onMutationTestReportReady(report, metrics);
    this.determineExitCode(metrics);
  }

  private determineExitCode(metrics: MutationTestMetricsResult) {
    const mutationScore = metrics.systemUnderTestMetrics.metrics.mutationScore;
    const breaking = this.options.thresholds.break;
    const formattedScore = mutationScore.toFixed(2);
    if (typeof breaking === 'number') {
      if (mutationScore < breaking) {
        this.log.error(`Final mutation score ${formattedScore} under breaking threshold ${breaking}, setting exit code to 1 (failure).`);
        this.log.info('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
        setExitCode(1);
      } else {
        this.log.info(`Final mutation score of ${formattedScore} is greater than or equal to break threshold ${breaking}`);
      }
    } else {
      this.log.debug(
        "No breaking threshold configured. Won't fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior."
      );
    }
  }

  private mutationTestReport(results: readonly MutantResult[]): schema.MutationTestResult {
    // Mocha, jest and karma use test titles as test ids.
    // This can mean a lot of duplicate strings in the json report.
    // Therefore we remap the test ids here to numbers.
    const testIdMap = new Map(this.dryRunResult.tests.map((test, index) => [test.id, index.toString()]));
    const remapTestId = (id: string): string => testIdMap.get(id) ?? id;
    const remapTestIds = (ids: string[] | undefined): string[] | undefined => ids?.map(remapTestId);

    return {
      files: this.toFileResults(results, remapTestIds),
      schemaVersion: '1.0',
      thresholds: this.options.thresholds,
      testFiles: this.toTestFiles(remapTestId),
    };
  }

  private toFileResults(
    results: readonly MutantResult[],
    remapTestIds: (ids: string[] | undefined) => string[] | undefined
  ): schema.FileResultDictionary {
    const resultDictionary: schema.FileResultDictionary = Object.create(null);

    results.forEach((mutantResult) => {
      const fileResult = resultDictionary[mutantResult.fileName];
      const mutant = this.toMutantResult(mutantResult, remapTestIds);
      if (fileResult) {
        fileResult.mutants.push(mutant);
      } else {
        const sourceFile = this.inputFiles.files.find((file) => file.name === mutantResult.fileName);
        if (sourceFile) {
          resultDictionary[mutantResult.fileName] = {
            language: this.determineLanguage(sourceFile.name),
            mutants: [mutant],
            source: sourceFile.textContent,
          };
        } else {
          this.log.warn(
            normalizeWhitespaces(`File "${mutantResult.fileName}" not found
          in input files, but did receive mutant result for it. This shouldn't happen`)
          );
        }
      }
    });
    return resultDictionary;
  }

  private toTestFiles(remapTestId: (id: string) => string): schema.TestFileDefinitionDictionary {
    return {
      '': {
        tests: this.dryRunResult.tests.map((test) => this.toTestDefinition(test, remapTestId)),
      },
    };
  }

  private toTestDefinition(test: TestResult, remapTestId: (id: string) => string): schema.TestDefinition {
    return {
      id: remapTestId(test.id),
      name: test.name,
    };
  }

  private determineLanguage(name: string): string {
    const ext = path.extname(name).toLowerCase();
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.html':
      case '.vue':
        return 'html';
      default:
        return 'javascript';
    }
  }

  private toMutantResult(mutantResult: MutantResult, remapTestIds: (ids: string[] | undefined) => string[] | undefined): schema.MutantResult {
    const { range, fileName, location, killedBy, coveredBy, ...apiMutant } = mutantResult;
    return {
      ...apiMutant,
      killedBy: remapTestIds(killedBy),
      coveredBy: remapTestIds(coveredBy),
      location: this.toLocation(location),
    };
  }

  private toLocation(location: Location): schema.Location {
    return {
      end: this.toPosition(location.end),
      start: this.toPosition(location.start),
    };
  }

  private toPosition(pos: Position): schema.Position {
    return {
      column: pos.column + 1, // convert from 0-based to 1-based
      line: pos.line + 1,
    };
  }
}
