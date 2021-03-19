import path from 'path';

import { Location, Position, StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import {
  MutantResult,
  MutantStatus,
  mutationTestReportSchema,
  Reporter,
  TimeoutMutantResult,
  InvalidMutantResult,
  BaseMutantResult,
  UndetectedMutantResult,
  KilledMutantResult,
  IgnoredMutantResult,
} from '@stryker-mutator/api/report';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { calculateMetrics } from 'mutation-testing-metrics';
import { CompleteDryRunResult, MutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test-runner';
import { CheckStatus, PassedCheckResult, CheckResult } from '@stryker-mutator/api/check';

import { coreTokens } from '../di';
import { InputFileCollection } from '../input';
import { setExitCode } from '../utils/object-utils';
import { MutantTestCoverage } from '../mutants/find-mutant-test-coverage';
import { mutatedLines, originalLines } from '../utils/mutant-utils';

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
    return this.reportOne<InvalidMutantResult>(mutant, {
      status: this.checkStatusToResultStatus(checkResult.status),
      errorMessage: checkResult.reason,
    });
  }

  public reportNoCoverage(mutant: Mutant): MutantResult {
    return this.reportOne<UndetectedMutantResult>(mutant, { status: MutantStatus.NoCoverage, testFilter: [] });
  }

  public reportMutantIgnored(mutant: Mutant): MutantResult {
    return this.reportOne<IgnoredMutantResult>(mutant, { status: MutantStatus.Ignored, ignoreReason: mutant.ignoreReason! });
  }

  public reportMutantRunResult(mutantWithTestCoverage: MutantTestCoverage, result: MutantRunResult): MutantResult {
    const { mutant, testFilter } = mutantWithTestCoverage;
    switch (result.status) {
      case MutantRunStatus.Error:
        return this.reportOne<InvalidMutantResult>(mutant, { status: MutantStatus.RuntimeError, errorMessage: result.errorMessage });
      case MutantRunStatus.Killed:
        return this.reportOne<KilledMutantResult>(mutant, {
          status: MutantStatus.Killed,
          nrOfTestsRan: result.nrOfTests,
          killedBy: this.testNamesById.get(result.killedBy)!,
        });
      case MutantRunStatus.Timeout:
        return this.reportOne<TimeoutMutantResult>(mutant, { status: MutantStatus.TimedOut });
      case MutantRunStatus.Survived:
        return this.reportOne<UndetectedMutantResult>(mutant, {
          status: MutantStatus.Survived,
          nrOfTestsRan: result.nrOfTests,
          testFilter: testFilter ? this.dryRunResult.tests.filter((t) => testFilter.includes(t.id)).map((t) => t.name) : undefined,
        });
    }
  }

  private reportOne<T extends MutantResult>(mutant: Mutant, additionalFields: Omit<T, keyof BaseMutantResult> & { nrOfTestsRan?: number }) {
    const originalFileTextContent = this.inputFiles.filesToMutate.find((fileToMutate) => fileToMutate.name === mutant.fileName)!.textContent;

    const mutantResult = {
      id: mutant.id.toString(),
      location: mutant.location,
      mutatedLines: mutatedLines(originalFileTextContent, mutant),
      mutatorName: mutant.mutatorName,
      originalLines: originalLines(originalFileTextContent, mutant),
      range: mutant.range,
      replacement: mutant.replacement,
      fileName: mutant.fileName,
      nrOfTestsRan: 0,
      ...additionalFields,
    } as MutantResult;
    this.reporter.onMutantTested(mutantResult);

    return mutantResult;
  }

  private checkStatusToResultStatus(status: Exclude<CheckStatus, CheckStatus.Passed>): MutantStatus.CompileError {
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

  private determineExitCode(report: mutationTestReportSchema.MutationTestResult) {
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

  private mutationTestReport(results: readonly MutantResult[]): mutationTestReportSchema.MutationTestResult {
    return {
      files: this.toFileResults(results),
      schemaVersion: '1.0',
      thresholds: this.options.thresholds,
    };
  }

  private toFileResults(results: readonly MutantResult[]): mutationTestReportSchema.FileResultDictionary {
    const resultDictionary: mutationTestReportSchema.FileResultDictionary = Object.create(null);
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

  private toMutantResult(mutantResult: MutantResult): mutationTestReportSchema.MutantResult {
    return {
      id: mutantResult.id,
      location: this.toLocation(mutantResult.location),
      mutatorName: mutantResult.mutatorName,
      replacement: mutantResult.replacement,
      status: this.toStatus(mutantResult.status),
      description: this.describe(mutantResult),
    };
  }

  private toLocation(location: Location): mutationTestReportSchema.Location {
    return {
      end: this.toPosition(location.end),
      start: this.toPosition(location.start),
    };
  }

  private toPosition(pos: Position): mutationTestReportSchema.Position {
    return {
      column: pos.column + 1, // convert from 0-based to 1-based
      line: pos.line + 1,
    };
  }

  private toStatus(status: MutantStatus): mutationTestReportSchema.MutantStatus {
    switch (status) {
      case MutantStatus.Killed:
        return mutationTestReportSchema.MutantStatus.Killed;
      case MutantStatus.NoCoverage:
        return mutationTestReportSchema.MutantStatus.NoCoverage;
      case MutantStatus.RuntimeError:
        return mutationTestReportSchema.MutantStatus.RuntimeError;
      case MutantStatus.Survived:
        return mutationTestReportSchema.MutantStatus.Survived;
      case MutantStatus.TimedOut:
        return mutationTestReportSchema.MutantStatus.Timeout;
      case MutantStatus.CompileError:
        return mutationTestReportSchema.MutantStatus.CompileError;
      case MutantStatus.Ignored:
        return mutationTestReportSchema.MutantStatus.Ignored;
      default:
        this.logUnsupportedMutantStatus(status);
        return mutationTestReportSchema.MutantStatus.RuntimeError;
    }
  }

  private describe(mutantResult: MutantResult): string | undefined {
    switch (mutantResult.status) {
      case MutantStatus.Ignored:
        return `Ignore reason: ${mutantResult.ignoreReason}`;
      case MutantStatus.Killed:
        return `Killed by: ${mutantResult.killedBy}`;
      case MutantStatus.CompileError:
      case MutantStatus.RuntimeError:
        return `Error message: ${mutantResult.errorMessage}`;
      default:
        return undefined;
    }
  }

  private logUnsupportedMutantStatus(status: never) {
    this.log.warn('Unable to convert "%s" to a MutantStatus', status);
  }
}
