import { getLogger } from 'stryker-api/logging';
import { MatchedMutant, MutantResult, Reporter, ScoreResult, SourceFile } from 'stryker-api/report';
import { isPromise } from '../utils/objectUtils';
import StrictReporter from './StrictReporter';

export interface NamedReporter {
  name: string;
  reporter: Reporter;
}

export default class BroadcastReporter implements StrictReporter {

  private readonly log = getLogger(BroadcastReporter.name);
  constructor(private readonly reporters: NamedReporter[]) {
  }

  public onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.broadcast('onAllMutantsMatchedWithTests', results);
  }

  public onAllMutantsTested(results: MutantResult[]): void {
    this.broadcast('onAllMutantsTested', results);
  }

  public onAllSourceFilesRead(files: SourceFile[]): void {
    this.broadcast('onAllSourceFilesRead', files);
  }

  public onMutantTested(result: MutantResult): void {
    this.broadcast('onMutantTested', result);
  }

  public onScoreCalculated(score: ScoreResult): void {
    this.broadcast('onScoreCalculated', score);
  }

  public onSourceFileRead(file: SourceFile): void {
    this.broadcast('onSourceFileRead', file);
  }

  public wrapUp(): void | Promise<void> {
    return this.broadcast('wrapUp', undefined);
  }

  private broadcast(methodName: keyof Reporter, eventArgs: any): Promise<any> | void {
    const allPromises: Array<Promise<void>> = [];
    this.reporters.forEach(namedReporter => {
      if (typeof namedReporter.reporter[methodName] === 'function') {
        try {
          const maybePromise = (namedReporter.reporter[methodName] as any)(eventArgs);
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

  private handleError(error: Error, methodName: string, reporterName: string) {
    this.log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }

}
