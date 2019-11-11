import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import { mutationScoreThresholds } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';

import * as ciProvider from '../../../../src/reporters/ci/Provider';
import DashboardReporter from '../../../../src/reporters/dashboard-reporter/DashboardReporter';
import {
  default as DashboardReporterClient,
  default as StrykerDashboardClient,
  StrykerDashboardReport
} from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens';
import * as environmentVariables from '../../../../src/utils/objectUtils';
import { mock, Mock } from '../../../helpers/producers';

describe(DashboardReporter.name, () => {
  let sut: DashboardReporter;
  let dashboardClientMock: Mock<StrykerDashboardClient>;
  let getEnvironmentVariables: sinon.SinonStub;
  let determineCiProvider: sinon.SinonStub;
  const dummyReport: mutationTestReportSchema.MutationTestResult = {
    files: {},
    schemaVersion: '1.0',
    thresholds: mutationScoreThresholds({})
  };

  beforeEach(() => {
    dashboardClientMock = mock(StrykerDashboardClient);
    getEnvironmentVariables = sinon.stub(environmentVariables, 'getEnvironmentVariable');
    determineCiProvider = sinon.stub(ciProvider, 'determineCIProvider');
  });

  function setupEnvironmentVariables(env?: { ci?: boolean; pullRequest?: boolean; repository?: string; branch?: string; apiKey?: string }) {
    const { ci, pullRequest, repository, branch, apiKey } = Object.assign(
      {
        apiKey: '12345',
        branch: 'master',
        ci: true,
        pullRequest: false,
        repository: 'stryker-mutator/stryker'
      },
      env
    );

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
    sut = testInjector.injector
      .provideValue(dashboardReporterTokens.dashboardReporterClient, (dashboardClientMock as unknown) as DashboardReporterClient)
      .injectClass(DashboardReporter);
  }

  it('should report mutation score to report server', async () => {
    // Arrange
    setupEnvironmentVariables();

    // Act
    sut.onMutationTestReportReady({
      files: {
        'src/file.js': {
          language: 'js',
          mutants: [
            {
              id: '1',
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
              mutatorName: 'Block',
              replacement: '{}',
              status: mutationTestReportSchema.MutantStatus.Killed
            },
            {
              id: '1',
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
              mutatorName: 'Block',
              replacement: '{}',
              status: mutationTestReportSchema.MutantStatus.Killed
            },
            {
              id: '1',
              location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
              mutatorName: 'Block',
              replacement: '{}',
              status: mutationTestReportSchema.MutantStatus.Survived
            }
          ],
          source: 'console.log("hello world!")'
        }
      },
      schemaVersion: '1.0',
      thresholds: mutationScoreThresholds({})
    });

    // Assert
    const report: StrykerDashboardReport = {
      apiKey: '12345',
      branch: 'master',
      mutationScore: 66.66666666666666,
      repositorySlug: 'github.com/stryker-mutator/stryker'
    };

    expect(dashboardClientMock.postStrykerDashboardReport).to.have.been.calledWith(report);
    expect(testInjector.logger.warn).to.have.not.been.called;
  });

  it('should log an info if it is not part of a CI build', async () => {
    // Arrange
    setupEnvironmentVariables({ ci: undefined });

    // Act
    sut.onMutationTestReportReady(dummyReport);

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(testInjector.logger.info).to.have.been.calledWithMatch('Dashboard report is not sent when not running on a build server');
  });

  it('should log an info if it is a pull request', async () => {
    // Arrange
    setupEnvironmentVariables({ pullRequest: true });

    // Act
    sut.onMutationTestReportReady(dummyReport);

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(testInjector.logger.info).to.have.been.calledWithMatch('Dashboard report is not sent when building a pull request');
  });

  it('should log a warning if the Stryker API key is unknown', async () => {
    // Arrange
    setupEnvironmentVariables({ apiKey: undefined });

    // Act
    sut.onMutationTestReportReady(dummyReport);

    // Assert
    expect(dashboardClientMock.postStrykerDashboardReport).to.have.not.been.called;
    expect(testInjector.logger.warn).to.have.been.calledWithMatch('Missing environment variable STRYKER_DASHBOARD_API_KEY');
  });
});
