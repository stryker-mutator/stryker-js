import { Reporter, SourceFile, MutantResult, MatchedMutant, ScoreResult } from 'stryker-api/report';
import { getLogger } from 'stryker-api/logging';
import { isPromise } from '../utils/objectUtils';
import StrictReporter from './StrictReporter';
import { keys, PluginResolver, PluginKind, Inject } from 'stryker-api/di';
import { StrykerOptions } from 'stryker-api/core';

export default class BroadcastReporter implements StrictReporter {

  public static readonly inject = keys('options', 'pluginResolver', 'inject');
  private readonly log = getLogger(BroadcastReporter.name);
  private readonly reporters: {
    [name: string]: Reporter;
  };
  constructor(private readonly options: StrykerOptions, pluginResolver: PluginResolver, inject: Inject) {
    this.reporters = {};
    this.options.reporters.forEach(reporterName => this.reporters[reporterName] = inject(pluginResolver.resolve(PluginKind.Reporter, reporterName)));
  }

  private broadcast(methodName: keyof Reporter, eventArgs: any): Promise<any> | void {
    const allPromises: Promise<void>[] = [];
    Object.keys(this.reporters).forEach(reporterName => {
      const reporter = this.reporters[reporterName];
      if (typeof reporter[methodName] === 'function') {
        try {
          const maybePromise = (reporter[methodName] as any)(eventArgs);
          if (isPromise(maybePromise)) {
            allPromises.push(maybePromise.catch(error => {
              this.handleError(error, methodName, reporterName);
            }));
          }
        } catch (error) {
          this.handleError(error, methodName, reporterName);
        }
      }

    });
    if (allPromises.length) {
      return Promise.all(allPromises);
    }
  }

  public onSourceFileRead(file: SourceFile): void {
    this.broadcast('onSourceFileRead', file);
  }

  public onAllSourceFilesRead(files: SourceFile[]): void {
    this.broadcast('onAllSourceFilesRead', files);
  }

  public onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void {
    this.broadcast('onAllMutantsMatchedWithTests', results);
  }

  public onMutantTested(result: MutantResult): void {
    this.broadcast('onMutantTested', result);
  }

  public onAllMutantsTested(results: MutantResult[]): void {
    this.broadcast('onAllMutantsTested', results);
  }

  public onScoreCalculated(score: ScoreResult): void {
    this.broadcast('onScoreCalculated', score);
  }

  public wrapUp(): void | Promise<void> {
    return this.broadcast('wrapUp', undefined);
  }

  private handleError(error: Error, methodName: string, reporterName: string) {
    this.log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }

}
