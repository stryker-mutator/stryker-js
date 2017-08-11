import * as path from 'path';
import * as _ from 'lodash';
import { getLogger } from 'log4js';
import { MutationScoreThresholds } from 'stryker-api/core';
import { MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import { freezeRecursively, setExitCode } from './utils/objectUtils';


export default class ScoreResultCalculator {

  static calculate(results: MutantResult[]): ScoreResult {
    return this.calculateScoreResult(results, '');
  }

  static determineExitCode(score: ScoreResult, thresholds: MutationScoreThresholds | undefined) {
    const breaking = thresholds && thresholds.break;
    const formattedScore = score.mutationScore.toFixed(2);
    if (typeof breaking === 'number') {
      if (score.mutationScore < breaking) {
        log.error(`Final mutation score ${formattedScore} under breaking threshold ${breaking}, setting exit code to 1 (failure).`);
        log.info('(improve mutation score or set `thresholds.break = null` to prevent this error in the future)');
        setExitCode(1);
      } else {
        log.info(`Final mutation score of ${formattedScore} is greater than or equal to break threshold ${breaking}`);
      }
    } else {
      log.debug('No breaking threshold configured. Won\'t fail the build no matter how low your mutation score is. Set `thresholds.break` to change this behavior.');
    }
  }

  private static calculateScoreResult(results: MutantResult[], basePath: string): ScoreResult {
    const numbers = this.countNumbers(results);
    const facts = this.determineFacts(basePath, results);
    return freezeRecursively(_.assign(numbers, facts));
  }

  private static determineFacts(basePath: string, results: MutantResult[]) {
    const name = this.determineCommonBasePath(results, basePath);
    const childResults = this.calculateChildScores(results, name, basePath);
    return {
      name,
      path: path.join(basePath, name),
      childResults,
      representsFile: childResults.length === 0
    };
  }

  private static compareScoreResults(a: ScoreResult, b: ScoreResult) {
    const sortValue = (scoreResult: ScoreResult) => {
      // Directories first
      if (scoreResult.representsFile) {
        return `1${scoreResult.name}`;
      } else {
        return `0${scoreResult.name}`;
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

        .map(directory => this.calculateScoreResult(_.flatMap(filesGroupedByDirectory[directory], file => resultsGroupedByFiles[file]), childrenBasePath))
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

const log = getLogger(ScoreResultCalculator.name);