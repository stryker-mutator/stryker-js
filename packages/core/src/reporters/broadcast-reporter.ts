import {
  MutantResult,
  schema,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import {
  DryRunCompletedEvent,
  MutationTestingPlanReadyEvent,
  Reporter,
} from '@stryker-mutator/api/report';
import { MutationTestMetricsResult } from 'mutation-testing-metrics';
import { tokens } from 'typed-inject';

import { coreTokens, PluginCreator } from '../di/index.js';

import { StrictReporter } from './strict-reporter.js';

export class BroadcastReporter implements StrictReporter {
  public static readonly inject = tokens(
    commonTokens.options,
    coreTokens.pluginCreator,
    commonTokens.logger,
    coreTokens.reporterOverride,
  );

  public readonly reporters: Record<string, Reporter>;
  constructor(
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator,
    private readonly log: Logger,
    private readonly reporterOverride: Reporter | undefined,
  ) {
    this.reporters = {};
    if (this.reporterOverride) {
      this.reporters['in-memory'] = this.reporterOverride;
    } else {
      this.options.reporters.forEach((reporterName) =>
        this.createReporter(reporterName),
      );
    }
    this.logAboutReporters();
  }

  private createReporter(reporterName: string): void {
    if (reporterName === 'progress' && !process.stdout.isTTY) {
      this.log.info(
        'Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter',
      );
      reporterName = 'progress-append-only';
    }
    this.reporters[reporterName] = this.pluginCreator.create(
      PluginKind.Reporter,
      reporterName,
    );
  }

  private logAboutReporters(): void {
    const reporterNames = Object.keys(this.reporters);
    if (reporterNames.length) {
      if (this.log.isDebugEnabled()) {
        this.log.debug(
          `Broadcasting to reporters ${JSON.stringify(reporterNames)}`,
        );
      }
    } else {
      this.log.warn(
        "No reporter configured. Please configure one or more reporters in the (for example: reporters: ['progress'])",
      );
    }
  }

  private broadcast<TMethod extends keyof Reporter>(
    methodName: TMethod,
    ...eventArgs: Parameters<Required<Reporter>[TMethod]>
  ): Promise<void[]> {
    return Promise.all(
      Object.entries(this.reporters).map(async ([reporterName, reporter]) => {
        if (reporter[methodName]) {
          try {
            await (
              reporter[methodName] as (
                ...args: Parameters<Required<Reporter>[TMethod]>
              ) => Promise<void> | void
            )(...eventArgs);
          } catch (error) {
            this.handleError(error, methodName, reporterName);
          }
        }
      }),
    );
  }

  public onDryRunCompleted(event: DryRunCompletedEvent): void {
    void this.broadcast('onDryRunCompleted', event);
  }
  public onMutationTestingPlanReady(
    event: MutationTestingPlanReadyEvent,
  ): void {
    void this.broadcast('onMutationTestingPlanReady', event);
  }

  public onMutantTested(result: MutantResult): void {
    void this.broadcast('onMutantTested', result);
  }

  public onMutationTestReportReady(
    report: schema.MutationTestResult,
    metrics: MutationTestMetricsResult,
  ): void {
    void this.broadcast('onMutationTestReportReady', report, metrics);
  }

  public async wrapUp(): Promise<void> {
    await this.broadcast('wrapUp');
  }

  private handleError(
    error: unknown,
    methodName: string,
    reporterName: string,
  ) {
    this.log.error(
      `An error occurred during '${methodName}' on reporter '${reporterName}'.`,
      error,
    );
  }
}
