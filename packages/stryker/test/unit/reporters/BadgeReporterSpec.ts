import { expect } from 'chai';
import * as sinon from 'sinon';
import BadgeReporter from '../../../src/reporters/BadgeReporter';
import { StrykerBadgeReport } from '../../../src/reporters/BadgeReporter/StrykerBadgeClient';
import * as environmentVariables from '../../../src/utils/objectUtils';
import StrykerBadgeClient from '../../../src/reporters/BadgeReporter/StrykerBadgeClient';
import { scoreResult, mock, Mock } from '../../helpers/producers';
import { Logger } from 'log4js';
import currentLogMock from '../../helpers/log4jsMock';
import { Config } from 'stryker-api/config';

describe('BadgeReporter', () => {
  let sut: BadgeReporter;
  let log: Mock<Logger>;
  let badgeClientMock: Mock<StrykerBadgeClient>;
  let getEnvironmentVariables: sinon.SinonStub;

  beforeEach(() => {
    log = currentLogMock();
    badgeClientMock = mock(StrykerBadgeClient);
    getEnvironmentVariables = sandbox.stub(environmentVariables, 'getEnvironmentVariable');
  });

  function setupEnvironmentVariables(env?: {
    travis?: boolean
    pullRequest?: string;
    repository?: string;
    branch?: string;
    apiKey?: string;
  }) {
    const { travis, pullRequest, repository, branch, apiKey } = Object.assign({
      travis: true,
      pullRequest: 'false',
      repository: 'stryker-mutator/stryker',
      branch: 'master',
      apiKey: '12345'
    }, env);
    getEnvironmentVariables.withArgs('TRAVIS').returns(travis);
    getEnvironmentVariables.withArgs('TRAVIS_PULL_REQUEST').returns(pullRequest);
    getEnvironmentVariables.withArgs('TRAVIS_REPO_SLUG').returns(repository);
    getEnvironmentVariables.withArgs('TRAVIS_BRANCH').returns(branch);
    getEnvironmentVariables.withArgs('STRYKER_BADGE_API_KEY').returns(apiKey);
  }

  it('should report mutation score to report server', async () => {
    // Arrange
    setupEnvironmentVariables();
    sut = new BadgeReporter(new Config, badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

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

  it('should log a info if it is not a travis build', async () => {
    // Arrange
    setupEnvironmentVariables({ travis: undefined });
    sut = new BadgeReporter(badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
    expect(log.info).to.have.been.calledWithMatch('Badge report is not send when stryker didn\'t run on buildserver {TRAVIS=true}');
  });

  it('should log a info if it is a pull request', async () => {
    // Arrange
    setupEnvironmentVariables({ pullRequest: '1' });
    sut = new BadgeReporter(badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
    expect(log.info).to.have.been.calledWithMatch('Badge report is not send when build is for a pull request {TRAVIS_PULL_REQUEST=<number>}');
  });

  it('should log a warning if the repository is unknown', async () => {
    // Arrange
    setupEnvironmentVariables({ repository: undefined });
    sut = new BadgeReporter(badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
    expect(log.warn).to.have.been.calledWithMatch('Missing environment variable TRAVIS_REPO_SLUG');
  });

  it('should log a warning if the branch is unknown', async () => {
    // Arrange
    setupEnvironmentVariables({ branch: undefined });
    sut = new BadgeReporter(badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({
      mutationScore: 79.10
    }));

    // Assert
    expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
    expect(log.warn).to.have.been.calledWithMatch('Missing environment variable TRAVIS_BRANCH');
  });

  it('should log a warning if the stryker api key is unknown', async () => {
    // Arrange
    setupEnvironmentVariables({ apiKey: undefined });
    sut = new BadgeReporter(badgeClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({
      mutationScore: 79.10
    }));

    // Assert
    expect(badgeClientMock.postStrykerBadgeReport).to.have.not.been.called;
    expect(log.warn).to.have.been.calledWithMatch('Missing environment variable STRYKER_BADGE_API_KEY');
  });
});
