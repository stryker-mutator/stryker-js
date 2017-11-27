import {Reporter, ScoreResult} from 'stryker-api/report';
import StrykerBadgeClient from './BadgeReporter/StrykerBadgeClient';
import {getEnvironmentVariable} from '../utils/objectUtils';
import { getLogger } from 'log4js';
import { StrykerOptions } from 'stryker-api/core';

export default class BadgeReporter implements Reporter {
  private readonly log = getLogger(BadgeReporter.name);

  constructor(
    setting: StrykerOptions,
    private strykerBadgeClient: StrykerBadgeClient = new StrykerBadgeClient()
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
        const apiKey = this.readEnvironmentVariable('STRYKER_BADGE_API_KEY');

        if (repository && branch && apiKey) {
          await this.strykerBadgeClient.postStrykerBadgeReport({
            apiKey: apiKey,
            repositorySlug: 'github/' + repository,
            branch: branch,
            mutationScore: mutationScore,
            reportData: []
          });
        }
      } else {
        this.log.info('Badge report is not send when build is for a pull request {TRAVIS_PULL_REQUEST=<number>}');
      }
    } else {
      this.log.info('Badge report is not send when stryker didn\'t run on buildserver {TRAVIS=true}');
    }
  }
}