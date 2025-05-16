import { StrykerOptions, ReportType, schema } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { MutationTestMetricsResult } from 'mutation-testing-metrics';

import { CIProvider } from '../ci/provider.js';

import { DashboardReporterClient } from './dashboard-reporter-client.js';
import { dashboardReporterTokens } from './tokens.js';
import { Report } from './report.js';

export class DashboardReporter implements Reporter {
  public static readonly inject = tokens(
    commonTokens.logger,
    dashboardReporterTokens.dashboardReporterClient,
    commonTokens.options,
    dashboardReporterTokens.ciProvider,
  );

  constructor(
    private readonly log: Logger,
    private readonly dashboardReporterClient: DashboardReporterClient,
    private readonly options: StrykerOptions,
    private readonly ciProvider: CIProvider | null,
  ) {}

  private onGoingWork: Promise<void> | undefined;

  public onMutationTestReportReady(
    result: schema.MutationTestResult,
    metrics: MutationTestMetricsResult,
  ): void {
    this.onGoingWork = (async () => {
      const { projectName, version, moduleName } =
        this.getContextFromEnvironment();
      if (projectName && version) {
        await this.update(
          this.toReport(result, metrics),
          projectName,
          version,
          moduleName,
        );
      } else {
        this.log.info(
          'The report was not send to the dashboard. The dashboard.project and/or dashboard.version values were missing and not detected to be running on a build server.',
        );
      }
    })();
  }

  public async wrapUp(): Promise<void> {
    await this.onGoingWork;
  }

  private toReport(
    result: schema.MutationTestResult,
    metrics: MutationTestMetricsResult,
  ): Report {
    if (this.options.dashboard.reportType === ReportType.Full) {
      return result;
    } else {
      return {
        mutationScore: metrics.systemUnderTestMetrics.metrics.mutationScore,
      };
    }
  }

  private async update(
    report: Report,
    projectName: string,
    version: string,
    moduleName: string | undefined,
  ) {
    try {
      const href = await this.dashboardReporterClient.updateReport({
        report,
        moduleName,
        projectName,
        version: version,
      });
      this.log.info('Report available at: %s', href);
    } catch (err) {
      this.log.error('Could not upload report.', err);
    }
  }

  private getContextFromEnvironment() {
    return {
      moduleName: this.options.dashboard.module,
      projectName:
        this.options.dashboard.project ?? this.ciProvider?.determineProject(),
      version:
        this.options.dashboard.version ?? this.ciProvider?.determineVersion(),
    };
  }
}
