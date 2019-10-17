import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema, Reporter } from '@stryker-mutator/api/report';
import { calculateMetrics } from 'mutation-testing-metrics';
import { getEnvironmentVariableOrThrow } from '../../utils/objectUtils';
import { CIProvider } from '../ci/Provider';
import DashboardReporterClient from './DashboardReporterClient';
import { dashboardReporterTokens } from './tokens';

export default class DashboardReporter implements Reporter {

  public static readonly inject = tokens(commonTokens.logger, dashboardReporterTokens.dashboardReporterClient, commonTokens.options, dashboardReporterTokens.ciProvider);

  constructor(
    private readonly log: Logger,
    private readonly dashboardReporterClient: DashboardReporterClient,
    private readonly options: StrykerOptions,
    private readonly ciProvider: CIProvider | null
  ) { }

  public async onMutationTestReportReady(report: mutationTestReportSchema.MutationTestResult) {
    if (this.ciProvider) {
      if (this.options.experimentalFullReport) {
        await this.sendFullReport(report, this.ciProvider);
      } else {
        await this.sendMutationScore(report, this.ciProvider);
      }
    } else {
      this.log.info('Dashboard report is not sent when not running on a build server');
    }
  }

  private async sendFullReport(report: mutationTestReportSchema.MutationTestResult, ciProvider: CIProvider) {
    try {
      const href = await this.dashboardReporterClient.putFullResult({
        report,
        ...this.getContextFromEnvironment(ciProvider)
      });
      this.log.info('Report available at: %s', href);
    }
    catch (err) {
      this.log.error('Could not upload report.', err);
    }
  }

  private async sendMutationScore(report: mutationTestReportSchema.MutationTestResult, ciProvider: CIProvider) {
    const isPullRequest = ciProvider.isPullRequest();

    if (!isPullRequest) {
      const metricsResult = calculateMetrics(report.files);
      const context = this.getContextFromEnvironment(ciProvider);

      await this.dashboardReporterClient.postMutationScoreReport({
        apiKey: context.apiKey,
        branch: context.version,
        mutationScore: metricsResult.metrics.mutationScore,
        repositorySlug: context.repositorySlug
      });
    } else {
      this.log.info('Dashboard mutation score is not sent when building a pull request');
    }
  }

  private getContextFromEnvironment(ciProvider: CIProvider) {
    return {
      apiKey: getEnvironmentVariableOrThrow('STRYKER_DASHBOARD_API_KEY'),
      moduleName: this.options.moduleName || null,
      repositorySlug: ciProvider.determineSlug(),
      version: ciProvider.determineVersion(),
    };
  }
}
