import { expect } from 'chai';
import * as sinon from 'sinon';
import { Config } from 'stryker-api/config';
import { Logger } from 'stryker-api/logging';
import * as ciProvider from '../../../src/reporters/ci/Provider';
import StrykerDashboardClient, { StrykerDashboardReport } from '../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import DashboardReporter from '../../../src/reporters/DashboardReporter';
import * as environmentVariables from '../../../src/utils/objectUtils';
import currentLogMock from '../../helpers/logMock';
import { mock, Mock, scoreResult } from '../../helpers/producers';

describe('DashboardReporter', () => {
  let sut: DashboardReporter;
  let log: Mock<Logger>;
  let dashboardClientMock: Mock<StrykerDashboardClient>;
  let getEnvironmentVariables: sinon.SinonStub;
  let determineCiProvider: sinon.SinonStub;

  beforeEach(() => {
    log = currentLogMock();
    dashboardClientMock = mock(StrykerDashboardClient);
    getEnvironmentVariables = sandbox.stub(environmentVariables, 'getEnvironmentVariable');
    determineCiProvider = sandbox.stub(ciProvider, 'determineCIProvider');
  });

  function setupEnvironmentVariables(env?: {
    apiKey?: string;
    branch?: string;
    ci?: boolean;
    pullRequest?: boolean;
    repository?: string;
  }) {
    const { ci, pullRequest, repository, branch, apiKey } = {
      apiKey: '12345',
      branch: 'master',
      ci: true,
      pullRequest: false,
      repository: 'stryker-mutator/stryker',
      ...env
    };

    if (ci) {
      determineCiProvider.returns({
        determineBranch: () => branch,
        determineRepository: () => repository,
        isPullRequest: () => pullRequest
      });
    } else {
      determineCiProvider.returns(undefined);
    }

    getEnvironmentVariables.withArgs('STRYKER_DASHBOARD_API_KEY').returns(apiKey);
  }

  it('should report mutation score to report server', async () => {
    // Arrange
    setupEnvironmentVariables();
    sut = new DashboardReporter(new Config(), dashboardClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    const report: StrykerDashboardReport = {
      apiKey: '12345',
      branch: 'master',
      mutationScore: 79.10,
      repositorySlug: 'github.com/stryker-mutator/stryker'
    };

    expect(dashboardClientMock.postStrykerDashboardReport).to.have.been.calledWith(report);
    expect(log.warn).to.have.not.been.called;
  });

  it('should log an info if it is not part of a CI build', async () => {
    // Arrange
    setupEnvironmentVariables({ ci: undefined });
    sut = new DashboardReporter(dashboardClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(log.info).to.have.been.calledWithMatch('Dashboard report is not sent when not running on a buildserver');
  });

  it('should log an info if it is a pull request', async () => {
    // Arrange
    setupEnvironmentVariables({ pullRequest: true });
    sut = new DashboardReporter(dashboardClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({ mutationScore: 79.10 }));

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(log.info).to.have.been.calledWithMatch('Dashboard report is not sent when building a pull request');
  });

  it('should log a warning if the Stryker API key is unknown', async () => {
    // Arrange
    setupEnvironmentVariables({ apiKey: undefined });
    sut = new DashboardReporter(dashboardClientMock as any);

    // Act
    sut.onScoreCalculated(scoreResult({
      mutationScore: 79.10
    }));

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(log.warn).to.have.been.calledWithMatch('Missing environment variable STRYKER_DASHBOARD_API_KEY');
  });
});
