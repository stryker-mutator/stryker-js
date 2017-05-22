import { MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { freezeRecursively } from './utils/objectUtils';
import * as _ from 'lodash';
import * as path from 'path';

export default class ScoreResultCalculator {

  static calculate(results: MutantResult[], basePath: string = ''): ScoreResult {
    const name = this.determineCommonBasePath(results, basePath);
    const childResults = this.calculateChildScores(results, name, basePath);
    const numbers = this.calculateNumbers(results, childResults);
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

  private static calculateChildScores(results: MutantResult[], name: string, basePath: string) {
    const childrenBasePath = path.join(basePath, name) + path.sep;
    const resultsByFiles = _.groupBy(results, result => result.sourceFilePath.substr(childrenBasePath.length));
    const uniqueFiles = Object.keys(resultsByFiles);
    if (uniqueFiles.length > 1) {
      const filesGroupedByDirectory = _.groupBy(uniqueFiles, file => file.split(path.sep)[0]);
      return Object.keys(filesGroupedByDirectory)
        .map(directory => this.calculate(_.flatMap(filesGroupedByDirectory[directory], file => resultsByFiles[file]), childrenBasePath))
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
      return '/';
    }
  }

  private static calculateNumbers(mutantResults: MutantResult[], childScores: ScoreResult[]) {
    if (childScores.length) {
      return this.calculateNumbersBasedOnChildScores(childScores);
    } else {
      return this.countNumbers(mutantResults);
    }
  }

  private static calculateNumbersBasedOnChildScores(childScores: ScoreResult[]) {
    const sum = (expression: (score: ScoreResult) => number) => _.sum(childScores.map(expression));
    const totalDetected = sum(_ => _.totalDetected);
    const totalUndetected = sum(_ => _.totalUndetected);
    const totalMutants = sum(_ => _.totalMutants);
    const totalCovered = sum(_ => _.totalCovered);
    return {
      killed: sum(_ => _.killed),
      timedOut: sum(_ => _.timedOut),
      survived: sum(_ => _.survived),
      noCoverage: sum(_ => _.noCoverage),
      errors: sum(_ => _.errors),
      totalDetected,
      totalUndetected,
      totalMutants,
      totalCovered,
      mutationScore: totalDetected / totalMutants * 100 || 0,
      mutationScoreBasedOnCoveredCode: totalDetected / totalCovered * 100 || 0
    };
  }

  private static countNumbers(mutantResults: MutantResult[]) {
    let killed = 0;
    let timedOut = 0;
    let survived = 0;
    let noCoverage = 0;
    let errors = 0;
    mutantResults.forEach(mutation => {
      switch (mutation.status) {
        case MutantStatus.Killed:
          killed++;
          break;
        case MutantStatus.TimedOut:
          timedOut++;
          break;
        case MutantStatus.Survived:
          survived++;
          break;
        case MutantStatus.NoCoverage:
          noCoverage++;
          break;
        case MutantStatus.Error:
          errors++;
          break;
      }
    });
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
      mutationScore: Math.floor(totalDetected / totalMutants * 100) || 0,
      mutationScoreBasedOnCoveredCode: Math.floor(totalDetected / totalCovered * 100) || 0
    };
  }
}