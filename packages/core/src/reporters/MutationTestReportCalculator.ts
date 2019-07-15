import * as path from 'path';
import { MutantResult, mutationTestReportSchema, Reporter, MutantStatus } from '@stryker-mutator/api/report';
import { StrykerOptions, Location, Position } from '@stryker-mutator/api/core';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../di';
import { Logger } from '@stryker-mutator/api/logging';
import InputFileCollection from '../input/InputFileCollection';
import { normalizeWhitespaces } from '@stryker-mutator/util';

export class MutationTestReportCalculator {

  public static inject = tokens(coreTokens.Reporter, COMMON_TOKENS.options, coreTokens.InputFiles, COMMON_TOKENS.logger);

  constructor(
    private readonly reporter: Required<Reporter>,
    private readonly options: StrykerOptions,
    private readonly inputFiles: InputFileCollection,
    private readonly log: Logger
  ) { }

  public report(results: ReadonlyArray<MutantResult>) {
    this.reporter.onMutationTestReportReady(this.mutationTestReport(results));
  }

  private mutationTestReport(results: ReadonlyArray<MutantResult>): mutationTestReportSchema.MutationTestResult {
    return {
      files: this.toFileResults(results),
      schemaVersion: '1.0',
      thresholds: this.options.thresholds
    };
  }

  private toFileResults(results: ReadonlyArray<MutantResult>): mutationTestReportSchema.FileResultDictionary {
    const resultDictionary: mutationTestReportSchema.FileResultDictionary = Object.create(null);
    results.forEach(mutantResult => {
      const fileResult = resultDictionary[mutantResult.sourceFilePath];
      if (fileResult) {
        fileResult.mutants.push(this.toMutantResult(mutantResult));
      } else {
        const sourceFile = this.inputFiles.files.find(file => file.name === mutantResult.sourceFilePath);
        if (sourceFile) {
          resultDictionary[mutantResult.sourceFilePath] = {
            language: this.determineLanguage(sourceFile.name),
            mutants: [this.toMutantResult(mutantResult)],
            source: sourceFile.textContent
          };
        } else {
          this.log.warn(normalizeWhitespaces(`File "${mutantResult.sourceFilePath}" not found
          in input files, but did receive mutant result for it. This shouldn't happen`));
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
      status: this.toStatus(mutantResult.status)
    };
  }

  private toLocation(location: Location): mutationTestReportSchema.Location {
    return {
      end: this.toPosition(location.end),
      start: this.toPosition(location.start)
    };
  }

  private toPosition(pos: Position): mutationTestReportSchema.Position {
    return {
      column: pos.column + 1, // convert from 0-based to 1-based
      line: pos.line + 1
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
      case MutantStatus.TranspileError:
        return mutationTestReportSchema.MutantStatus.CompileError;
      default:
        this.logUnsupportedMutantStatus(status);
        return mutationTestReportSchema.MutantStatus.RuntimeError;
    }
  }

  private logUnsupportedMutantStatus(status: never) {
    this.log.warn('Unable to convert "%s" to a MutantStatus', status);
  }
}
