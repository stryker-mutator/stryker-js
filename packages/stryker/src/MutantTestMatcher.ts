import { getLogger } from 'log4js';
import * as _ from 'lodash';
import { RunResult, CoverageCollection, StatementMap, CoveragePerTestResult, CoverageResult } from 'stryker-api/test_runner';
import { Location, StrykerOptions, File, TextFile } from 'stryker-api/core';
import { MatchedMutant } from 'stryker-api/report';
import { Mutant } from 'stryker-api/mutant';
import TestableMutant from './TestableMutant';
import StrictReporter from './reporters/StrictReporter';
import { FileCoverageDataDictionary } from './transpiler/CoverageInstrumenterTranspiler';
import { filterEmpty } from './utils/objectUtils';
import SourceFile from './SourceFile';
import { FunctionMapping, FileCoverageData } from 'istanbul-lib-coverage';


enum CoveredCodeIndicatorType {
  function,
  statement
}

/**
 * Represents a location inside the coverage data of a file
 * Either the function map, or statement map
 */
interface CoveredCodeIndicator {
  type: CoveredCodeIndicatorType;
  index: string;
}

export default class MutantTestMatcher {

  private readonly log = getLogger(MutantTestMatcher.name);
  constructor(private mutants: Mutant[], private files: File[], private initialRunResult: RunResult, private coveragePerFile: FileCoverageDataDictionary, private options: StrykerOptions, private reporter: StrictReporter) {
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
      testableMutants.forEach(mutant => mutant.addAllTestResults(this.initialRunResult));
    } else if (!this.initialRunResult.coverage) {
      this.log.warn('No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.', this.options.coverageAnalysis);
      testableMutants.forEach(mutant => mutant.addAllTestResults(this.initialRunResult));
    } else {
      testableMutants.forEach(testableMutant => this.enrichWithCoveredTests(testableMutant));
    }
    this.reporter.onAllMutantsMatchedWithTests(Object.freeze(testableMutants.map(this.mapMutantOnMatchedMutant)));
    return testableMutants;
  }

  enrichWithCoveredTests(testableMutant: TestableMutant) {
    const fileCoverage = this.coveragePerFile[testableMutant.mutant.fileName];
    const smallestCoveringIndicator = this.findMatchingCoveringIndicator(testableMutant, fileCoverage);
    if (smallestCoveringIndicator) {
      if (this.isCoveredByBaseline(testableMutant.mutant.fileName, smallestCoveringIndicator)) {
        testableMutant.addAllTestResults(this.initialRunResult);
      } else {
        this.initialRunResult.tests.forEach((testResult, id) => {
          if (this.isCoveredByTest(id, testableMutant.mutant.fileName, smallestCoveringIndicator)) {
            testableMutant.addTestResult(id, testResult);
          }
        });
      }
    } else {
      this.log.warn('Cannot find statement for mutant %s in statement map for file. Assuming that all tests cover this mutant. This might have a big impact on the performance.', this.stringify(testableMutant));
      testableMutant.addAllTestResults(this.initialRunResult);
    }
  }

  private isCoveredByBaseline(filename: string, coveredCodeIndicator: CoveredCodeIndicator): boolean {
    if (this.baseline) {
      const coverageResult = this.baseline[filename];
      return this.isCoveredByCoverageCollection(coverageResult, coveredCodeIndicator);
    } else {
      return false;
    }
  }

  private isCoveredByTest(testId: number, filename: string, coveredCodeIndicator: CoveredCodeIndicator): boolean {
    const coverageCollection = this.findCoverageCollectionForTest(testId);
    const coveredFile = coverageCollection && coverageCollection[filename];
    return this.isCoveredByCoverageCollection(coveredFile, coveredCodeIndicator);
  }

  private isCoveredByCoverageCollection(coveredFile: CoverageResult | null, coveredCodeIndicator: CoveredCodeIndicator): boolean {
    if (coveredFile) {
      if (coveredCodeIndicator.type === CoveredCodeIndicatorType.statement) {
        return coveredFile.s[coveredCodeIndicator.index] > 0;
      } else {
        return coveredFile.f[coveredCodeIndicator.index] > 0;
      }
    } else {
      return false;
    }
  }

  private createTestableMutants(): TestableMutant[] {
    const sourceFiles = this.files.filter(file => file.mutated).map(file => new SourceFile(file as TextFile));
    return filterEmpty(this.mutants.map(mutant => {
      const sourceFile = sourceFiles.find(file => file.name === mutant.fileName);
      if (sourceFile) {
        return new TestableMutant(mutant, sourceFile);
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
      mutatorName: testableMutant.mutant.mutatorName,
      scopedTestIds: testableMutant.selectedTests.map(testSelection => testSelection.id),
      timeSpentScopedTests: testableMutant.timeSpentScopedTests,
      fileName: testableMutant.mutant.fileName,
      replacement: testableMutant.mutant.replacement
    });
    return Object.freeze(matchedMutant);
  }

  private findMatchingCoveringIndicator(mutant: TestableMutant, fileCoverage: FileCoverageData): CoveredCodeIndicator | null {
    const statementIndex = this.findMatchingStatement(mutant, fileCoverage.statementMap);
    if (statementIndex) {
      return {
        type: CoveredCodeIndicatorType.statement,
        index: statementIndex
      };
    } else {
      const functionIndex = this.findMatchingFunction(mutant, fileCoverage.fnMap);
      if (functionIndex) {
        return {
          type: CoveredCodeIndicatorType.function,
          index: functionIndex
        };
      } else {
        return null;
      }
    }
  }

  /**
   * 
   * @param mutant The mutant
   * @param functionMap The function map of the covering file
   * @returns The index of the smallest function covering the mutant, or null if not found
   */
  private findMatchingFunction(mutant: TestableMutant, functionMap: { [key: string]: FunctionMapping }): string | null {
    let smallestFunction: string | null = null;
    if (functionMap) {
      Object.keys(functionMap).forEach(statementId => {
        let location = functionMap[statementId];
        if (this.locationCoversMutant(mutant.location, location.loc) && (!smallestFunction || this.isSmallerArea(functionMap[smallestFunction].loc, location.loc))) {
          smallestFunction = statementId;
        }
      });
    }
    return smallestFunction;
  }

  /**
   * Finds the smallest statement that covers a mutant.
   * @param mutant The mutant.
   * @param statementMap of the covering file.
   * @returns The index of the smallest statement surrounding the mutant, or null if not found.
   */
  private findMatchingStatement(mutant: TestableMutant, statementMap: StatementMap): string | null {
    let smallestStatement: string | null = null;
    if (statementMap) {
      Object.keys(statementMap).forEach(statementId => {
        let location = statementMap[statementId];

        if (this.locationCoversMutant(mutant.location, location) && (!smallestStatement || this.isSmallerArea(statementMap[smallestStatement], location))) {
          smallestStatement = statementId;
        }
      });
    }
    return smallestStatement;
  }

  /**
   * Indicates whether the second location is smaller than the first location.
   * @param first The area which may cover a bigger area than the second location.
   * @param second The area which may cover a smaller area than the first location.
   * @returns true if the second location covers a smaller area than the first.
   */
  private isSmallerArea(first: Location, second: Location): boolean {
    let firstLocationHasSmallerArea = false;
    let lineDifference = (first.end.line - first.start.line) - (second.end.line - second.start.line);
    let coversLessLines = lineDifference > 0;
    let coversLessColumns = lineDifference === 0 && (second.start.column - first.start.column) + (first.end.column - second.end.column) > 0;
    if (coversLessLines || coversLessColumns) {
      firstLocationHasSmallerArea = true;
    }
    return firstLocationHasSmallerArea;
  }

  /**
   * Indicates whether a location covers a mutant.
   * @param mutantLocation The location of the mutant.
   * @param statementLocation The location of the statement.
   * @returns true if the location covers the mutant.
   */
  private locationCoversMutant(mutantLocation: Location, statementLocation: Location): boolean {
    let mutantIsAfterStart = mutantLocation.start.line > statementLocation.start.line ||
      (mutantLocation.start.line === statementLocation.start.line && mutantLocation.start.column >= statementLocation.start.column);
    let mutantIsBeforeEnd = mutantLocation.end.line < statementLocation.end.line ||
      (mutantLocation.end.line === statementLocation.end.line && mutantLocation.end.column <= statementLocation.end.column);

    return mutantIsAfterStart && mutantIsBeforeEnd;
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

  private stringify(mutant: TestableMutant) {
    return `${mutant.mutant.mutatorName}: (${mutant.replacement}) file://${mutant.fileName}:${mutant.location.start.line + 1}:${mutant.location.start.column}`;
  }
}