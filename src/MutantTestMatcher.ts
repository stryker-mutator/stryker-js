import * as log4js from 'log4js';
import * as _ from 'lodash';
import Mutant from './Mutant';
import StrictReporter from './reporters/StrictReporter';
import { MatchedMutant } from 'stryker-api/report';
import { StatementMapDictionary } from './coverage/CoverageInstrumenter';
import { RunResult, CoverageCollection, StatementMap, CoveragePerTestResult } from 'stryker-api/test_runner';
import { Location, StrykerOptions } from 'stryker-api/core';

const log = log4js.getLogger('MutantTestMatcher');

export default class MutantTestMatcher {

  constructor(private mutants: Mutant[], private initialRunResult: RunResult, private statementMaps: StatementMapDictionary, private options: StrykerOptions, private reporter: StrictReporter) {
  }

  private get baseline(): CoverageCollection | null {
    if (this.isCoveragePerTestResult(this.initialRunResult.coverage)) {
      return this.initialRunResult.coverage.baseline;
    } else {
      return null;
    }
  }

  matchWithMutants() {
    if (this.options.coverageAnalysis === 'off') {
      this.mutants.forEach(mutant => mutant.addAllTestResults(this.initialRunResult));
    } else if (!this.initialRunResult.coverage) {
      log.warn('No coverage result found, even though coverageAnalysis is "%s". Assuming that all tests cover each mutant. This might have a big impact on the performance.', this.options.coverageAnalysis);
      this.mutants.forEach(mutant => mutant.addAllTestResults(this.initialRunResult));
    } else
      this.mutants.forEach(mutant => {
        const statementMap = this.statementMaps[mutant.filename];
        const smallestStatement = this.findSmallestCoveringStatement(mutant, statementMap);
        if (smallestStatement) {
          if (this.isCoveredByBaseline(mutant.filename, smallestStatement)) {
            mutant.addAllTestResults(this.initialRunResult);
          } else {
            this.initialRunResult.tests.forEach((testResult, id) => {
              if (this.isCoveredByTest(id, mutant.filename, smallestStatement)) {
                mutant.addTestResult(id, testResult);
              }
            });
          }
        } else {
          log.warn('Cannot find statement for mutant %s in statement map for file. Assuming that all tests cover this mutant. This might have a big impact on the performance.', mutant.toString());
          mutant.addAllTestResults(this.initialRunResult);
        }
      });
    this.reporter.onAllMutantsMatchedWithTests(Object.freeze(this.mutants.map(this.mapMutantOnMatchedMutant)));
  }

  private isCoveredByBaseline(filename: string, statementId: string): boolean {
    if (this.baseline) {
      const coverageCollection = this.baseline[filename];
      return coverageCollection && coverageCollection.s[statementId] > 0;
    } else {
      return false;
    }
  }

  private isCoveredByTest(testId: number, filename: string, statementId: string) {
    const coverageCollection = this.findCoverageCollectionForTest(testId);
    const coveredFile = coverageCollection && coverageCollection[filename];
    return coveredFile && coveredFile.s[statementId] > 0;
  }

  /**
   * Map the Mutant object on the MatchMutant Object.
   * @param mutant The mutant.
   * @returns The MatchedMutant
   */
  private mapMutantOnMatchedMutant(mutant: Mutant): MatchedMutant {
    const matchedMutant = _.cloneDeep({
      mutatorName: mutant.mutatorName,
      scopedTestIds: mutant.scopedTestIds,
      timeSpentScopedTests: mutant.timeSpentScopedTests,
      filename: mutant.filename,
      replacement: mutant.replacement
    });
    return Object.freeze(matchedMutant);
  }

  /**
   * Finds the smallest statement that covers a mutant.
   * @param mutant The mutant.
   * @param statementMap of the covering file.
   * @returns The index of the coveredFile which contains the smallest statement surrounding the mutant.
   */
  private findSmallestCoveringStatement(mutant: Mutant, statementMap: StatementMap): string | null {
    let smallestStatement: string | null = null;
    if (statementMap) {
      Object.keys(statementMap).forEach(statementId => {
        let location = statementMap[statementId];

        if (this.statementCoversMutant(mutant.location, location) && (!smallestStatement || this.isNewSmallestStatement(statementMap[smallestStatement], location))) {
          smallestStatement = statementId;
        }
      });
    }
    return smallestStatement;
  }

  /**
   * Indicates whether a statement is the smallest statement of the two statements provided.
   * @param originalLocation The area which may cover a bigger area than the newLocation.
   * @param newLocation The area which may cover a smaller area than the originalLocation.
   * @returns true if the newLocation covers a smaller area than the originalLocation, making it the smaller statement.
   */
  private isNewSmallestStatement(originalLocation: Location, newLocation: Location): boolean {
    let statementIsSmallestStatement = false;
    if (!originalLocation) {
      statementIsSmallestStatement = true;
    } else {
      let lineDifference = (originalLocation.end.line - originalLocation.start.line) - (newLocation.end.line - newLocation.start.line);
      let coversLessLines = lineDifference > 0;
      let coversLessColumns = lineDifference === 0 && (newLocation.start.column - originalLocation.start.column) + (originalLocation.end.column - newLocation.end.column) > 0;
      if (coversLessLines || coversLessColumns) {
        statementIsSmallestStatement = true;
      }
    }
    return statementIsSmallestStatement;
  }

  /**
   * Indicates whether a statement covers a mutant.
   * @param mutantLocation The location of the mutant.
   * @param statementLocation The location of the statement.
   * @returns true if the statment covers the mutant.
   */
  private statementCoversMutant(mutantLocation: Location, statementLocation: Location): boolean {
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
}