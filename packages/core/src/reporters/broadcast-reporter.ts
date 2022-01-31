import { MutantTestCoverage, MutantResult, schema, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter, SourceFile } from '@stryker-mutator/api/report';
import { MutationTestMetricsResult } from 'mutation-testing-metrics';
import { tokens } from 'typed-inject';

import { coreTokens } from '../di/index.js';
import { PluginCreator } from '../di/plugin-creator.js';

import { StrictReporter } from './strict-reporter.js';

export class BroadcastReporter implements StrictReporter {
  public static readonly inject = tokens(commonTokens.options, coreTokens.pluginCreatorReporter, commonTokens.logger);

  public readonly reporters: Record<string, Reporter>;
  constructor(
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator<PluginKind.Reporter>,
    private readonly log: Logger
  ) {
    this.reporters = {};
    this.options.reporters.forEach((reporterName) => this.createReporter(reporterName));
    this.logAboutReporters();
  }

  private createReporter(reporterName: string): void {
    if (reporterName === 'progress' && !process.stdout.isTTY) {
      this.log.info('Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter');
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
      this.log.warn("No reporter configured. Please configure one or more reporters in the (for example: reporters: ['progress'])");
    }
  }

  private broadcast<TMethod extends keyof Reporter>(methodName: TMethod, ...eventArgs: Parameters<Required<Reporter>[TMethod]>): Promise<void[]> {
    return Promise.all(
      Object.entries(this.reporters).map(async ([reporterName, reporter]) => {
        if (reporter[methodName]) {
          try {
            await (reporter[methodName] as (...args: Parameters<Required<Reporter>[TMethod]>) => Promise<void> | void)!(...eventArgs);
          } catch (error) {
            this.handleError(error, methodName, reporterName);
          }
        }
      })
    );
  }

  public onSourceFileRead(file: SourceFile): void {
    this.broadcast('onSourceFileRead', file);
  }

  public onAllSourceFilesRead(files: SourceFile[]): void {
    this.broadcast('onAllSourceFilesRead', files);
  }

  public onAllMutantsMatchedWithTests(results: readonly MutantTestCoverage[]): void {
    this.broadcast('onAllMutantsMatchedWithTests', results);
  }

  public onMutantTested(result: MutantResult): void {
    this.broadcast('onMutantTested', result);
  }

  public onAllMutantsTested(results: MutantResult[]): void {
    this.broadcast('onAllMutantsTested', results);
  }

  public onMutationTestReportReady(report: schema.MutationTestResult, metrics: MutationTestMetricsResult): void {
    this.broadcast('onMutationTestReportReady', report, metrics);
  }

  public async wrapUp(): Promise<void> {
    await this.broadcast('wrapUp');
  }

  private handleError(error: unknown, methodName: string, reporterName: string) {
    this.log.error(`An error occurred during '${methodName}' on reporter '${reporterName}'.`, error);
  }
}
