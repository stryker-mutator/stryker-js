import { MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { freezeRecursively } from './utils/objectUtils';
import * as _ from 'lodash';
import * as path from 'path';

export default class ScoreResultCalculator {

  static calculate(results: MutantResult[]): ScoreResult {
    return this.calculateScoreResult(results, '');
  }

  private static calculateScoreResult(results: MutantResult[], basePath: string): ScoreResult {
    const name = this.determineCommonBasePath(results, basePath);
    const childResults = this.calculateChildScores(results, name, basePath);
    const numbers = this.countNumbers(results);
    return freezeRecursively(_.assign(numbers, { name, childResults }));
  }

  private static compareScoreResults(a: ScoreResult, b: ScoreResult) {
    const sortValue = (scoreResult: ScoreResult) => {
      // Directories first
      if (scoreResult.childResults.length) {
        return `0${scoreResult.name}`;
      } else {
        return `1${scoreResult.name}`;
      }
    };
    return sortValue(a).localeCompare(sortValue(b));
  }

  private static calculateChildScores(results: MutantResult[], parentName: string, basePath: string) {
    const childrenBasePath = parentName.length ? path.join(basePath, parentName) + path.sep : '';
    const resultsGroupedByFiles = _.groupBy(results, result => result.sourceFilePath.substr(childrenBasePath.length));
    const uniqueFiles = Object.keys(resultsGroupedByFiles);

    if (uniqueFiles.length > 1) {
      const filesGroupedByDirectory = _.groupBy(uniqueFiles, file => file.split(path.sep)[0]);
      return Object.keys(filesGroupedByDirectory)
      
        .map(directory => this.calculateScoreResult( _.flatMap(filesGroupedByDirectory[directory], file => resultsGroupedByFiles[file]), childrenBasePath))
        .sort(this.compareScoreResults);
    } else {
      return [];
    }
  }

  private static determineCommonBasePath(results: MutantResult[], basePath: string) {
    const uniqueFiles = _.uniq(results.map(result => result.sourceFilePath));
    const uniqueFileDirectories = uniqueFiles.map(file => file.substr(basePath.length).split(path.sep));
    
    if (uniqueFileDirectories.length) {
      return uniqueFileDirectories
        .reduce((previousDirectories, currentDirectories) => previousDirectories.filter((token, index) => currentDirectories[index] === token))
        .join(path.sep);
    } else {
      return '';
    }
  }

  private static countNumbers(mutantResults: MutantResult[]) {
    const count = (mutantResult: MutantStatus) => mutantResults.filter(_ => _.status === mutantResult).length;

    const killed = count(MutantStatus.Killed);
    const timedOut = count(MutantStatus.TimedOut);
    const survived = count(MutantStatus.Survived);
    const noCoverage = count(MutantStatus.NoCoverage);
    const errors = count(MutantStatus.Error);
    const totalDetected = timedOut + killed;
    const totalUndetected = survived + noCoverage;
    const totalMutants = totalDetected + totalUndetected;
    const totalCovered = totalDetected + survived;
    return {
      killed,
      survived,
      noCoverage,
      errors,
      timedOut,
      totalDetected,
      totalUndetected,
      totalMutants,
      totalCovered,
      mutationScore: totalDetected / totalMutants * 100 || 0,
      mutationScoreBasedOnCoveredCode: totalDetected / totalCovered * 100 || 0
    };
  }
}