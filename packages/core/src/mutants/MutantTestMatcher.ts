import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { MatchedMutant } from '@stryker-mutator/api/report';
import { CoverageCollection, CoveragePerTestResult, CoverageResult, StatementMap } from '@stryker-mutator/api/test_runner';
import * as _ from 'lodash';
import { coreTokens } from '../di';
import InputFileCollection from '../input/InputFileCollection';
import { InitialTestRunResult } from '../process/InitialTestExecutor';
import StrictReporter from '../reporters/StrictReporter';
import SourceFile from '../SourceFile';
import TestableMutant, { TestSelectionResult } from '../TestableMutant';
import { CoverageMaps } from '../transpiler/CoverageInstrumenterTranspiler';
import LocationHelper from '../utils/LocationHelper';
import { filterEmpty } from '../utils/objectUtils';

const enum StatementIndexKind {
  Function,
  Statement
}

/**
 * Represents a statement index inside the coverage maps of a file
 * Either the function map, or statement map
 */
interface StatementIndex {
  kind: StatementIndexKind;
  index: string;
}

export class MutantTestMatcher {
  public static inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.reporter, coreTokens.inputFiles, coreTokens.initialRunResult);
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly reporter: StrictReporter,
    private readonly input: InputFileCollection,
    private readonly initialRunResult: InitialTestRunResult
  ) {}

  private get baseline(): CoverageCollection | null {
    if (this.isCoveragePerTestResult(this.initialRunResult.runResult.coverage)) {
      return this.initialRunResult.runResult.coverage.baseline;
    } else {
      return null;
    }
  }

  public async matchWithMutants(mutants: readonly Mutant[]): Promise<readonly TestableMutant[]> {
    const testableMutants = this.createTestableMutants(mutants);

    if (this.options.coverageAnalysis === 'off') {
      testableMutants.forEach(mutant => mutant.selectAllTests(this.initialRunResult.runResult, TestSelectionResult.Success));
    } else if (!this.initialRunResult.runResult.coverage) {
      this.log.warn(
        'No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.',
        this.options.coverageAnalysis
      );
      testableMutants.forEach(mutant => mutant.selectAllTests(this.initialRunResult.runResult, TestSelectionResult.FailedButAlreadyReported));
    } else {
      await Promise.all(testableMutants.map(testableMutant => this.enrichWithCoveredTests(testableMutant)));
    }
    this.reporter.onAllMutantsMatchedWithTests(Object.freeze(testableMutants.map(this.mapMutantOnMatchedMutant)));
    return testableMutants;
  }

  public async enrichWithCoveredTests(testableMutant: TestableMutant) {
    const transpiledLocation = await this.initialRunResult.sourceMapper.transpiledLocationFor({
      fileName: testableMutant.mutant.fileName,
      location: testableMutant.location
    });
    const fileCoverage = this.initialRunResult.coverageMaps[transpiledLocation.fileName];
    const statementIndex = this.findMatchingStatement(new LocationHelper(transpiledLocation.location), fileCoverage);
    if (statementIndex) {
      if (this.isCoveredByBaseline(transpiledLocation.fileName, statementIndex)) {
        testableMutant.selectAllTests(this.initialRunResult.runResult, TestSelectionResult.Success);
      } else {
        this.initialRunResult.runResult.tests.forEach((testResult, id) => {
          if (this.isCoveredByTest(id, transpiledLocation.fileName, statementIndex)) {
            testableMutant.selectTest(testResult, id);
          }
        });
      }
    } else {
      // Could not find a statement corresponding to this mutant
      // This can happen when for example mutating a TypeScript interface
      // It should result in an early result during mutation testing
      // Lets delay error reporting for now
      testableMutant.selectAllTests(this.initialRunResult.runResult, TestSelectionResult.Failed);
    }
  }

  private isCoveredByBaseline(fileName: string, statementIndex: StatementIndex): boolean {
    if (this.baseline) {
      const coverageResult = this.baseline[fileName];
      return this.isCoveredByCoverageCollection(coverageResult, statementIndex);
    } else {
      return false;
    }
  }

  private isCoveredByTest(testId: number, fileName: string, statementIndex: StatementIndex): boolean {
    const coverageCollection = this.findCoverageCollectionForTest(testId);
    const coveredFile = coverageCollection && coverageCollection[fileName];
    return this.isCoveredByCoverageCollection(coveredFile, statementIndex);
  }

  private isCoveredByCoverageCollection(coveredFile: CoverageResult | null, statementIndex: StatementIndex): boolean {
    if (coveredFile) {
      if (statementIndex.kind === StatementIndexKind.Statement) {
        return coveredFile.s[statementIndex.index] > 0;
      } else {
        return coveredFile.f[statementIndex.index] > 0;
      }
    } else {
      return false;
    }
  }

  private createTestableMutants(mutants: readonly Mutant[]): readonly TestableMutant[] {
    const sourceFiles = this.input.filesToMutate.map(file => new SourceFile(file));
    return filterEmpty(
      mutants.map((mutant, index) => {
        const sourceFile = sourceFiles.find(file => file.name === mutant.fileName);
        if (sourceFile) {
          return new TestableMutant(index.toString(), mutant, sourceFile);
        } else {
          this.log.error(
            `Mutant "${mutant.mutatorName}${mutant.replacement}" is corrupt, because cannot find a text file with name ${
              mutant.fileName
            }. List of source files: \n\t${sourceFiles.map(s => s.name).join('\n\t')}`
          );
          return null;
        }
      })
    );
  }

  /**
   * Map the Mutant object on the MatchMutant Object.
   * @param testableMutant The mutant.
   * @returns The MatchedMutant
   */
  private mapMutantOnMatchedMutant(testableMutant: TestableMutant): MatchedMutant {
    const matchedMutant = _.cloneDeep({
      fileName: testableMutant.mutant.fileName,
      id: testableMutant.id,
      mutatorName: testableMutant.mutant.mutatorName,
      replacement: testableMutant.mutant.replacement,
      scopedTestIds: testableMutant.selectedTests.map(testSelection => testSelection.id),
      timeSpentScopedTests: testableMutant.timeSpentScopedTests
    });
    return Object.freeze(matchedMutant);
  }

  private findMatchingStatement(location: LocationHelper, fileCoverage: CoverageMaps): StatementIndex | null {
    const statementIndex = this.findMatchingStatementInMap(location, fileCoverage.statementMap);
    if (statementIndex) {
      return {
        index: statementIndex,
        kind: StatementIndexKind.Statement
      };
    } else {
      const functionIndex = this.findMatchingStatementInMap(location, fileCoverage.fnMap);
      if (functionIndex) {
        return {
          index: functionIndex,
          kind: StatementIndexKind.Function
        };
      } else {
        return null;
      }
    }
  }

  /**
   * Finds the smallest statement that covers a location
   * @param needle The location to find.
   * @param haystack the statement map or function map to search in.
   * @returns The index of the smallest statement surrounding the location, or null if not found.
   */
  private findMatchingStatementInMap(needle: LocationHelper, haystack: StatementMap): string | null {
    let smallestStatement: { index: string | null; location: LocationHelper } = {
      index: null,
      location: LocationHelper.MAX_VALUE
    };
    if (haystack) {
      Object.keys(haystack).forEach(statementId => {
        const statementLocation = haystack[statementId];

        if (needle.isCoveredBy(statementLocation) && smallestStatement.location.isSmallerArea(statementLocation)) {
          smallestStatement = {
            index: statementId,
            location: new LocationHelper(statementLocation)
          };
        }
      });
    }
    return smallestStatement.index;
  }

  private findCoverageCollectionForTest(testId: number): CoverageCollection | null {
    if (this.initialRunResult.runResult.coverage) {
      if (this.isCoveragePerTestResult(this.initialRunResult.runResult.coverage)) {
        return this.initialRunResult.runResult.coverage.deviations[testId];
      } else {
        return this.initialRunResult.runResult.coverage;
      }
    } else {
      return null;
    }
  }

  private isCoveragePerTestResult(_coverage: CoverageCollection | CoveragePerTestResult | undefined): _coverage is CoveragePerTestResult {
    return this.options.coverageAnalysis === 'perTest';
  }
}
