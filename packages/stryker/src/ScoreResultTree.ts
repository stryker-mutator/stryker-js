import { MutantResult, MutantStatus, ScoreResult } from 'stryker-api/report';
import * as _ from 'lodash';
import * as path from 'path';

export default class ScoreResultTree implements ScoreResult {

  readonly childResults: ScoreResult[];
  readonly name: string;
  killed = 0;
  timedOut = 0;
  survived = 0;
  noCoverage = 0;
  errors = 0;

  get totalDetected() {
    return this.timedOut + this.killed;
  }
  get totalUndetected() {
    return this.survived + this.noCoverage;
  }
  get totalMutants() {
    return this.totalDetected + this.totalUndetected;
  }
  get mutationScore() {
    return Math.floor(this.totalDetected / this.totalMutants * 100) || 0;
  }
  get totalCovered() {
    return this.totalDetected + this.survived;
  }
  get percentageBasedOnCoveredCode() {
    return Math.floor(this.totalDetected / this.totalCovered * 100) || 0;
  }

  constructor(private results: MutantResult[], private basePath = '') {
    this.calculateScore();
    this.name = this.determineCommonBasePath(results);
    this.childResults = this.calculateChildScores(results);
  }

  private calculateChildScores(results: MutantResult[]) {
    const childrenBasePath = path.join(this.basePath, this.name) + path.sep;
    const resultsByFiles = _.groupBy(results, result => result.sourceFilePath.substr(childrenBasePath.length));
    const uniqueFiles = Object.keys(resultsByFiles);
    if (uniqueFiles.length > 1) {
      const filesGroupedByDirectory = _.groupBy(uniqueFiles, file => file.split(path.sep)[0]);
      return Object.keys(filesGroupedByDirectory)
        .map(directory => new ScoreResultTree(_.flatMap(filesGroupedByDirectory[directory], file => resultsByFiles[file]), childrenBasePath));
    } else {
      return [];
    }
  }

  private determineCommonBasePath(results: MutantResult[]) {
    const uniqueFiles = _.uniq(results.map(result => result.sourceFilePath));
    const filesTokens = uniqueFiles.map(file => file.substr(this.basePath.length).split(path.sep));
    return filesTokens
      .reduce((previousTokens, currentTokens) => previousTokens.filter((token, index) => currentTokens[index] === token))
      .join(path.sep);
  }

  private calculateScore() {
    this.results.forEach(mutation => {
      switch (mutation.status) {
        case MutantStatus.Killed:
          this.killed++;
          break;
        case MutantStatus.TimedOut:
          this.timedOut++;
          break;
        case MutantStatus.Survived:
          this.survived++;
          break;
        case MutantStatus.NoCoverage:
          this.noCoverage++;
          break;
        case MutantStatus.Error:
          this.errors++;
          break;
      }
    });
  }
}