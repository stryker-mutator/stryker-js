import { Reporter, SourceFile, MutantResult, MatchedMutant, ScoreResult } from '@stryker-mutator/api/report';
import { Logger } from '@stryker-mutator/api/logging';
import { isPromise } from '../utils/objectUtils';
import StrictReporter from './StrictReporter';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens } from 'typed-inject';
import { coreTokens } from '../di';
import { PluginCreator } from '../di/PluginCreator';

export default class BroadcastReporter implements StrictReporter {

  public static readonly inject = tokens(
    commonTokens.options,
    coreTokens.pluginCreatorReporter,
    commonTokens.logger);

  public readonly reporters: {
    [name: string]: Reporter;
  };
  constructor(
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator<PluginKind.Reporter>,
    private readonly log: Logger) {
    this.reporters = {};
    this.options.reporters.forEach(reporterName => this.createReporter(reporterName));
    this.logAboutReporters();
  }

  private createReporter(reporterName: string): void {
    if (reporterName === 'progress' && !process.stdout.isTTY) {
      this.log.info(
        'Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter'
      );
      reporterName = 'progress-append-only';
    }
    this.reporters[reporterName] = this.pluginCreator.create(reporterName);
  }

  private logAboutReporters(): void {
    const reporterNames = Object.keys(this.reporters);
    if (reporterNames.length) {
      if (this.log.isDebugEnabled()) {
        this.log.debug(`Broadcasting to reporters ${JSON.stringify(reporterNames)}`);
      }
    } else {
      this.log.warn('No reporter configured. Please configure one or more reporters in the (for example: reporters: [\'progress\'])');
    }
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

  public async wrapUp(): Promise<void> {
    await this.broadcast('wrapUp', undefined);
  }

  private handleError(error: Error, methodName: string, reporterName: string) {
    this.log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'. Error is: ${error}`);
  }
}
