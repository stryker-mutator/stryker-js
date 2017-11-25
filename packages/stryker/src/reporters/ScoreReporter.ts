import {Reporter, ScoreResult} from 'stryker-api/report';
import StrykerBadgeClient from './ScoreReporter/StrykerBadgeClient';
import {getEnvironmentVariable} from '../utils/objectUtils';
import { getLogger } from 'log4js';
import { StrykerOptions } from 'stryker-api/core';

export default class ScoreReporter implements Reporter {
  private readonly log = getLogger(ScoreReporter.name);

  constructor(
    setting: StrykerOptions,
    private strykerBadgeClient: StrykerBadgeClient = new StrykerBadgeClient()
  ) { }

  private isPullRequest: boolean;
  private repository: string | undefined;
  private branch: string | undefined;
  private apiKey: string | undefined;
  private mutationScore: number;

  private readEnvironmentVariables() {
    const isPullRequest = getEnvironmentVariable('TRAVIS_PULL_REQUEST') !== 'false';
    if (isPullRequest) {
      this.log.warn('Pull requests will not be reported to the badge report server');
    }
    this.isPullRequest = isPullRequest;

    const repository = getEnvironmentVariable('TRAVIS_REPO_SLUG');
    if (repository === undefined) {
      this.log.warn('Missing environment variable TRAVIS_REPO_SLUG to determine the repository');
    } 
    this.repository = repository;

    const branch = getEnvironmentVariable('TRAVIS_BRANCH');
    if (branch === undefined) {
      this.log.warn('Missing environment variable TRAVIS_BRANCH to determine the branch');
    } 
    this.branch = branch;

    const apiKey = getEnvironmentVariable('STRYKER_BADGE_API_KEY');
    if (apiKey === undefined) {
      this.log.warn('Missing environment variable STRYKER_BADGE_API_KEY to authenticate the call to the badge report server');
    } 
    this.apiKey = apiKey;
  }

  onScoreCalculated(ScoreResult: ScoreResult) {
    this.readEnvironmentVariables();
    this.mutationScore = ScoreResult.mutationScore;

    if (!this.isPullRequest && (this.branch !== undefined && this.apiKey !== undefined && this.repository !== undefined)) {
      this.work = this.strykerBadgeClient.postStrykerBadgeReport({
        api_key: this.apiKey,
        repository_slug: 'github/' + this.repository,
        branch: this.branch,
        mutation_score: this.mutationScore,
        report_data: []
      });
    } else {
      this.log.warn('Mutation score is not reported to the badge report server');
    }
    
  }

  private work: Promise<void>  | undefined;

  wrapUp() {
    return this.work;
  }
}