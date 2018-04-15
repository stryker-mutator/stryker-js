import * as _ from 'lodash';
import { getLogger } from 'log4js';
import { RunResult, CoverageCollection, StatementMap, CoveragePerTestResult, CoverageResult } from 'stryker-api/test_runner';
import { StrykerOptions, File } from 'stryker-api/core';
import { MatchedMutant } from 'stryker-api/report';
import { Mutant } from 'stryker-api/mutant';
import TestableMutant, { TestSelectionResult } from './TestableMutant';
import StrictReporter from './reporters/StrictReporter';
import { CoverageMapsByFile, CoverageMaps } from './transpiler/CoverageInstrumenterTranspiler';
import { filterEmpty } from './utils/objectUtils';
import SourceFile from './SourceFile';
import SourceMapper from './transpiler/SourceMapper';
import LocationHelper from './utils/LocationHelper';

enum StatementIndexKind {
  function,
  statement
}

/**
 * Represents a statement index inside the coverage maps of a file
 * Either the function map, or statement map
 */
interface StatementIndex {
  kind: StatementIndexKind;
  index: string;
}

export default class MutantTestMatcher {

  private readonly log = getLogger(MutantTestMatcher.name);

  constructor(
    private mutants: ReadonlyArray<Mutant>,
    private filesToMutate: ReadonlyArray<File>,
    private initialRunResult: RunResult,
    private sourceMapper: SourceMapper,
    private coveragePerFile: CoverageMapsByFile,
    private options: StrykerOptions,
    private reporter: StrictReporter) {
  }

  private get baseline(): CoverageCollection | null {
    if (this.isCoveragePerTestResult(this.initialRunResult.coverage)) {
      return this.initialRunResult.coverage.baseline;
    } else {
      return null;
    }
  }

  matchWithMutants(): TestableMutant[] {

    const testableMutants = this.createTestableMutants();

    if (this.options.coverageAnalysis === 'off') {
      testableMutants.forEach(mutant => mutant.selectAllTests(this.initialRunResult, TestSelectionResult.Success));
    } else if (!this.initialRunResult.coverage) {
      this.log.warn('No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.', this.options.coverageAnalysis);
      testableMutants.forEach(mutant => mutant.selectAllTests(this.initialRunResult, TestSelectionResult.FailedButAlreadyReported));
    } else {
      testableMutants.forEach(testableMutant => this.enrichWithCoveredTests(testableMutant));
    }
    this.reporter.onAllMutantsMatchedWithTests(Object.freeze(testableMutants.map(this.mapMutantOnMatchedMutant)));
    return testableMutants;
  }

  enrichWithCoveredTests(testableMutant: TestableMutant) {
    const transpiledLocation = this.sourceMapper.transpiledLocationFor({
      fileName: testableMutant.mutant.fileName,
      location: testableMutant.location
    });
    const fileCoverage = this.coveragePerFile[transpiledLocation.fileName];
    const statementIndex = this.findMatchingStatement(new LocationHelper(transpiledLocation.location), fileCoverage);
    if (statementIndex) {
      if (this.isCoveredByBaseline(transpiledLocation.fileName, statementIndex)) {
        testableMutant.selectAllTests(this.initialRunResult, TestSelectionResult.Success);
      } else {
        this.initialRunResult.tests.forEach((testResult, id) => {
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
      testableMutant.selectAllTests(this.initialRunResult, TestSelectionResult.Failed);
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
      if (statementIndex.kind === StatementIndexKind.statement) {
        return coveredFile.s[statementIndex.index] > 0;
      } else {
        return coveredFile.f[statementIndex.index] > 0;
      }
    } else {
      return false;
    }
  }

  private createTestableMutants(): TestableMutant[] {
    const sourceFiles = this.filesToMutate.map(file => new SourceFile(file));
    return filterEmpty(this.mutants.map((mutant, index) => {
      const sourceFile = sourceFiles.find(file => file.name === mutant.fileName);
      if (sourceFile) {
        return new TestableMutant(index.toString(), mutant, sourceFile);
      } else {
        this.log.error(`Mutant "${mutant.mutatorName}${mutant.replacement}" is corrupt, because cannot find a text file with name ${mutant.fileName}. List of source files: \n\t${sourceFiles.map(s => s.name).join('\n\t')}`);
        return null;
      }
    }));
  }


  /**
   * Map the Mutant object on the MatchMutant Object.
   * @param testableMutant The mutant.
   * @returns The MatchedMutant
   */
  private mapMutantOnMatchedMutant(testableMutant: TestableMutant): MatchedMutant {
    const matchedMutant = _.cloneDeep({
      id: testableMutant.id,
      mutatorName: testableMutant.mutant.mutatorName,
      scopedTestIds: testableMutant.selectedTests.map(testSelection => testSelection.id),
      timeSpentScopedTests: testableMutant.timeSpentScopedTests,
      fileName: testableMutant.mutant.fileName,
      replacement: testableMutant.mutant.replacement
    });
    return Object.freeze(matchedMutant);
  }

  private findMatchingStatement(location: LocationHelper, fileCoverage: CoverageMaps): StatementIndex | null {
    const statementIndex = this.findMatchingStatementInMap(location, fileCoverage.statementMap);
    if (statementIndex) {
      return {
        kind: StatementIndexKind.statement,
        index: statementIndex
      };
    } else {
      const functionIndex = this.findMatchingStatementInMap(location, fileCoverage.fnMap);
      if (functionIndex) {
        return {
          kind: StatementIndexKind.function,
          index: functionIndex
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
    let smallestStatement: { index: string | null, location: LocationHelper } = {
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
    if (this.initialRunResult.coverage) {
      if (this.isCoveragePerTestResult(this.initialRunResult.coverage)) {
        return this.initialRunResult.coverage.deviations[testId];
      } else {
        return this.initialRunResult.coverage;
      }
    } else {
      return null;
    }
  }

  private isCoveragePerTestResult(coverage: CoverageCollection | CoveragePerTestResult | undefined): coverage is CoveragePerTestResult {
    return this.options.coverageAnalysis === 'perTest';
  }
}