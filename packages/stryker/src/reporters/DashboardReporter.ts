import {Reporter, ScoreResult} from 'stryker-api/report';
import DashboardReporterClient from './dashboard-reporter/DashboardReporterClient';
import {getEnvironmentVariable} from '../utils/objectUtils';
import { determineCiProvider } from './ci/Provider';
import { getLogger } from 'log4js';
import { StrykerOptions } from 'stryker-api/core';

export default class DashboardReporter implements Reporter {
  private readonly log = getLogger(DashboardReporter.name);
  private readonly ciProvider = determineCiProvider();

  constructor(
    setting: StrykerOptions,
    private dashboardReporterClient: DashboardReporterClient = new DashboardReporterClient()
  ) { }

  private readEnvironmentVariable(name: string) {
    let environmentVariable = getEnvironmentVariable(name);
    if (environmentVariable) {
      return environmentVariable;
    } else {
      this.log.warn(`Missing environment variable ${name}`);
      return undefined;
    }
  }

  async onScoreCalculated(ScoreResult: ScoreResult) {
    const mutationScore = ScoreResult.mutationScore;

    if (this.ciProvider !== undefined) {
      const isPullRequest = this.ciProvider.isPullRequest();

      if (!isPullRequest) {
        const repository = this.ciProvider.determineRepository();
        const branch = this.ciProvider.determineBranch();
        const apiKey = this.readEnvironmentVariable('STRYKER_DASHBOARD_API_KEY');

        if (repository && branch && apiKey) {
          await this.dashboardReporterClient.postStrykerDashboardReport({
            apiKey,
            repositorySlug: 'github.com/' + repository,
            branch,
            mutationScore
          });
        }
      } else {
        this.log.info('Dashboard report is not sent when building a pull request');
      }
    } else {
      this.log.info('Dashboard report is not sent when not running on a buildserver');
    }
  }
}