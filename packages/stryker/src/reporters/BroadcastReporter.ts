import { Reporter, SourceFile, MutantResult, MatchedMutant, ScoreResult } from 'stryker-api/report';
import * as log4js from 'log4js';
import { isPromise } from '../utils/objectUtils';
import StrictReporter from './StrictReporter';

const log = log4js.getLogger('BroadcastReporter');

export interface NamedReporter {
  name: string;
  reporter: Reporter;
}

export default class BroadcastReporter implements StrictReporter {

  constructor(private reporters: NamedReporter[]) {
  }

  private broadcast(methodName: keyof Reporter, eventArgs: any = undefined): Promise<any> | void {
    let allPromises: Promise<any>[] = [];
    this.reporters.forEach(namedReporter => {
      if (typeof namedReporter.reporter[methodName] === 'function') {
        try {
          let maybePromise = (namedReporter.reporter[methodName] as any)(eventArgs);
          if (isPromise(maybePromise)) {
            allPromises.push(maybePromise.catch(error => {
              this.handleError(error, methodName, namedReporter.name);
            }));
          }
        } catch (error) {
          this.handleError(error, methodName, namedReporter.name);
        }
      }
    });
    if (allPromises.length) {
      return Promise.all(allPromises);
    }
  }

  onSourceFileRead(file: SourceFile): void {
    this.broadcast('onSourceFileRead', file);
  }

  onAllSourceFilesRead(files: SourceFile[]): void {
    this.broadcast('onAllSourceFilesRead', files);
  }

  onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.broadcast('onAllMutantsMatchedWithTests', results);
  }

  onMutantTested(result: MutantResult): void {
    this.broadcast('onMutantTested', result);
  }

  onAllMutantsTested(results: MutantResult[]): void {
    this.broadcast('onAllMutantsTested', results);
  }

  onScoreCalculated(score: ScoreResult): void {
    this.broadcast('onScoreCalculated', score);
  }

  wrapUp(): void | Promise<void> {
    return this.broadcast('wrapUp');
  }

  private handleError(error: any, methodName: string, reporterName: string) {
    log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }

}