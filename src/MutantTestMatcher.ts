import Mutant from './Mutant';
import { Reporter, MatchedMutant } from 'stryker-api/report';
import { StatementMapDictionary } from './coverage/CoverageInstrumenter';
import { RunResult, CoverageCollection, CoverageCollectionPerTest, CoverageResult, StatementMap } from 'stryker-api/test_runner';
import { Location, StrykerOptions } from 'stryker-api/core';
import * as _ from 'lodash';

export default class MutantTestMatcher {

  constructor(private mutants: Mutant[], private initialRunResult: RunResult, private statementMaps: StatementMapDictionary, private options: StrykerOptions, private reporter: Reporter) { }

  matchWithMutants() {
    this.mutants.forEach(mutant => {
      const statementMap = this.statementMaps[mutant.filename];
      const smallestStatement = this.findSmallestCoveringStatement(mutant, statementMap);
      this.initialRunResult.tests.forEach((testResult, id) => {
        let covered = false;
        const coverageCollection = this.findCoverageCollectionForTest(id);
        if (coverageCollection && smallestStatement) {
          let coveredFile = coverageCollection[mutant.filename];
          if (coveredFile) {
            covered = coveredFile.s[smallestStatement] > 0;
          }
        } else {
          // If there is no coverage data we have to assume that the test covers the mutant
          covered = true;
        }
        if (covered) {
          mutant.addTestResult(id, testResult);
        }
      });
    });

    this.reporter.onAllMutantsMatchedWithTests(Object.freeze(this.mutants.map(this.mapMutantOnMatchedMutant)));
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
  private findSmallestCoveringStatement(mutant: Mutant, statementMap: StatementMap): string {
    let smallestStatement: string = null;
    if (statementMap) {
      Object.keys(statementMap).forEach(statementId => {
        let location = statementMap[statementId];

        if (this.statementCoversMutant(mutant.location, location) && this.isNewSmallestStatement(statementMap[smallestStatement], location)) {
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

  private findCoverageCollectionForTest(testId: number): CoverageCollection {
    if (this.initialRunResult.coverage) {
      if (this.isCoverageCollectionPerTest(this.initialRunResult.coverage)) {
        return this.initialRunResult.coverage[testId];
      } else {
        return this.initialRunResult.coverage;
      }
    } else {
      return null;
    }
  }

  private isCoverageCollectionPerTest(coverage: CoverageCollection | CoverageCollectionPerTest): coverage is CoverageCollectionPerTest {
    return this.options.coverageAnalysis === 'perTest';
  }
}