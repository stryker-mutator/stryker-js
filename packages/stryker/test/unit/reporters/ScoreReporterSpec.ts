import { expect } from 'chai';
import * as sinon from 'sinon';
import ScoreReporter from '../../../src/reporters/ScoreReporter';
import { StrykerBadgeReport } from '../../../src/reporters/ScoreReporter/StrykerBadgeClient';
import * as environmentVariables from '../../../src/utils/objectUtils';
import StrykerBadgeClient from '../../../src/reporters/ScoreReporter/StrykerBadgeClient';
import { scoreResult, mock, Mock } from '../../helpers/producers';
import { Logger } from 'log4js';
import currentLogMock from '../../helpers/log4jsMock';
import { Config } from 'stryker-api/config';

describe('ScoreReporter', () => {
  let sut: ScoreReporter;
  let log: Mock<Logger>;
  let badgeClientMock: Mock<StrykerBadgeClient>;
  let getEnvironmentVariables: sinon.SinonStub;

  beforeEach(() => {
    log = currentLogMock();
    badgeClientMock = mock(StrykerBadgeClient);
    getEnvironmentVariables = sandbox.stub(environmentVariables, 'getEnvironmentVariable');
  });

  function setupEnvironmentVariables(env?: {
    pullRequest?: string;
    repository?: string;
    branch?: string;
    apiKey?: string;
  }) {
    const { pullRequest, repository, branch, apiKey } = Object.assign({
      pullRequest: 'false',
      repository: 'stryker-mutator/stryker',
      branch: 'master',
      apiKey: '12345'
    }, env);
    getEnvironmentVariables.withArgs('TRAVIS_PULL_REQUEST').returns(pullRequest);
    getEnvironmentVariables.withArgs('TRAVIS_REPO_SLUG').returns(repository);
    getEnvironmentVariables.withArgs('TRAVIS_BRANCH').returns(branch);
    getEnvironmentVariables.withArgs('STRYKER_BADGE_API_KEY').returns(apiKey);
  }

  describe('when not a pull request and repository, branch and api_key are known', () => {
    it('report mutations score to badge report server', async () => {
      // Arrange
      setupEnvironmentVariables();
      sut = new ScoreReporter(new Config, badgeClientMock as any);

      // Act
      sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));
      await sut.wrapUp();

      // Assert
      const report: StrykerBadgeReport = {
        api_key: '12345',
        repository_slug: 'github/stryker-mutator/stryker',
        branch: 'master',
        mutation_score: 79.10,
        report_data: []
      };

      expect(badgeClientMock.postStrykerBadgeReport).to.have.been.calledWith(report);
      expect(log.warn).to.have.not.been.called;
    });
  });

  describe('when the build is on pull request', () => {
    it('log that pull requests are not reported to the badge report server', async () => {
      // Arrange
      setupEnvironmentVariables({ pullRequest: '1' });
      sut = new ScoreReporter(badgeClientMock as any);

      // Act
      sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));
      await sut.wrapUp();

      // Assert
      expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
      expect(log.warn).to.have.been.calledWithMatch('Pull requests will not be reported to the badge report server');
      expect(log.warn).to.have.been.calledWithMatch('Mutation score is not reported to the badge report server');
    });
  });

  describe('when the repository is unknown', () => {
    it('log that the environment variable TRAVIS_REPO_SLUG should be set', async () => {
      // Arrange
      setupEnvironmentVariables({ repository: undefined });
      sut = new ScoreReporter(badgeClientMock as any);

      // Act
      sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));
      await sut.wrapUp();

      // Assert
      expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
      expect(log.warn).to.have.been.calledWithMatch('Missing environment variable TRAVIS_REPO_SLUG to determine the repository');
      expect(log.warn).to.have.been.calledWithMatch('Mutation score is not reported to the badge report server');
    });
  });

  describe('when the branch is unknown', () => {
    it('log that the environment variable TRAVIS_BRANCH should be set', async () => {
      // Arrange
      setupEnvironmentVariables({ branch: undefined });
      sut = new ScoreReporter(badgeClientMock as any);

      // Act
      sut.onScoreCalculated(scoreResult({
        mutationScore: 79.10
      }));
      await sut.wrapUp();

      // Assert
      expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
      expect(log.warn).to.have.been.calledWithMatch('Missing environment variable TRAVIS_BRANCH to determine the branch');
      expect(log.warn).to.have.been.calledWithMatch('Mutation score is not reported to the badge report server');
    });
  });

  describe('When the Stryker badge API key is unknown', () => {
    it('log that the environment variable STRYKER_BADGE_API_KEY should be set', async () => {
      // Arrange
      setupEnvironmentVariables({ apiKey: undefined });
      sut = new ScoreReporter(badgeClientMock as any);

      // Act
      sut.onScoreCalculated(scoreResult({
        mutationScore: 79.10
      }));
      await sut.wrapUp();

      // Assert
      expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
      expect(log.warn).to.have.been.calledWithMatch('Missing environment variable STRYKER_BADGE_API_KEY to authenticate the call to the badge report server');
      expect(log.warn).to.have.been.calledWithMatch('Mutation score is not reported to the badge report server');
    });
  });
});
