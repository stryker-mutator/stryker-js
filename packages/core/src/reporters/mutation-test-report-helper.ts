import path from 'path';

import { Location, Position, StrykerOptions, Mutant, MutantTestCoverage, MutantResult, schema, MutantStatus } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { calculateMetrics } from 'mutation-testing-metrics';
import { CompleteDryRunResult, MutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test-runner';
import { CheckStatus, PassedCheckResult, CheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { InputFileCollection } from '../input/input-file-collection';
import { setExitCode } from '../utils/object-utils';

/**
 * A helper class to convert and report mutants that survived or get killed
 */
export class MutationTestReportHelper {
  private readonly testNamesById: Map<string, string>;

  public static inject = tokens(coreTokens.reporter, commonTokens.options, coreTokens.inputFiles, commonTokens.logger, coreTokens.dryRunResult);
  constructor(
    private readonly reporter: Required<Reporter>,
    private readonly options: StrykerOptions,
    private readonly inputFiles: InputFileCollection,
    private readonly log: Logger,
    private readonly dryRunResult: CompleteDryRunResult
  ) {
    this.testNamesById = new Map(this.dryRunResult.tests.map((test) => [test.id, test.name]));
  }

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

  public reportMutantRunResult(mutantWithTestCoverage: MutantTestCoverage, result: MutantRunResult): MutantResult {
    switch (result.status) {
      case MutantRunStatus.Error:
        return this.reportOne({
          ...mutantWithTestCoverage,
          status: MutantStatus.RuntimeError,
          statusReason: result.errorMessage,
        });
      case MutantRunStatus.Killed:
        return this.reportOne({
          ...mutantWithTestCoverage,
          status: MutantStatus.Killed,
          testsCompleted: result.nrOfTests,
          killedBy: [this.testNamesById.get(result.killedBy)!],
        });
      case MutantRunStatus.Timeout:
        return this.reportOne({
          ...mutantWithTestCoverage,
          status: MutantStatus.Timeout,
        });
      case MutantRunStatus.Survived:
        return this.reportOne({
          ...mutantWithTestCoverage,
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
    this.reporter.onAllMutantsTested(results);
    this.reporter.onMutationTestReportReady(report);
    this.determineExitCode(report);
  }

  private determineExitCode(report: schema.MutationTestResult) {
    const { metrics } = calculateMetrics(report.files);
    const breaking = this.options.thresholds.break;
    const formattedScore = metrics.mutationScore.toFixed(2);
    if (typeof breaking === 'number') {
      if (metrics.mutationScore < breaking) {
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
    return {
      files: this.toFileResults(results),
      schemaVersion: '1.0',
      thresholds: this.options.thresholds,
    };
  }

  private toFileResults(results: readonly MutantResult[]): schema.FileResultDictionary {
    const resultDictionary: schema.FileResultDictionary = Object.create(null);
    results.forEach((mutantResult) => {
      const fileResult = resultDictionary[mutantResult.fileName];
      if (fileResult) {
        fileResult.mutants.push(this.toMutantResult(mutantResult));
      } else {
        const sourceFile = this.inputFiles.files.find((file) => file.name === mutantResult.fileName);
        if (sourceFile) {
          resultDictionary[mutantResult.fileName] = {
            language: this.determineLanguage(sourceFile.name),
            mutants: [this.toMutantResult(mutantResult)],
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

  public determineLanguage(name: string): string {
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

  private toMutantResult(mutantResult: MutantResult): schema.MutantResult {
    return {
      id: mutantResult.id,
      location: this.toLocation(mutantResult.location),
      mutatorName: mutantResult.mutatorName,
      replacement: mutantResult.replacement,
      status: mutantResult.status,
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
