import {Reporter, ScoreResult} from 'stryker-api/report';
import DashboardReporterClient from './dashboard-reporter/DashboardReporterClient';
import {getEnvironmentVariable} from '../utils/objectUtils';
import { getLogger } from 'log4js';
import { StrykerOptions } from 'stryker-api/core';

export default class DashboardReporter implements Reporter {
  private readonly log = getLogger(DashboardReporter.name);

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
    const travisBuild = getEnvironmentVariable('TRAVIS');

    if (travisBuild) {
      const pullRequest = getEnvironmentVariable('TRAVIS_PULL_REQUEST');

      if (pullRequest === 'false') {
        const repository = this.readEnvironmentVariable('TRAVIS_REPO_SLUG');
        const branch = this.readEnvironmentVariable('TRAVIS_BRANCH');
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
        this.log.info('Dashboard report is not sent when build is for a pull request {TRAVIS_PULL_REQUEST=<number>}');
      }
    } else {
      this.log.info('Dashboard report is not sent when stryker didn\'t run on buildserver {TRAVIS=true}');
    }
  }
}