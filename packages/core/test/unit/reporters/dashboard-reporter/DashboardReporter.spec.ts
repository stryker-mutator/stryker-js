import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import {
  mutationTestReportSchemaFileResult,
  mutationTestReportSchemaMutantResult,
  mutationTestReportSchemaMutationTestResult
} from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CIProvider } from '../../../../src/reporters/ci/Provider';
import DashboardReporter from '../../../../src/reporters/dashboard-reporter/DashboardReporter';
import {
  default as DashboardReporterClient,
  default as StrykerDashboardClient,
  MutationScoreReport
} from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens';
import { EnvironmentVariableStore } from '../../../helpers/EnvironmentVariableStore';
import { mock, Mock } from '../../../helpers/producers';

describe(DashboardReporter.name, () => {
  const environmentVariableStore = new EnvironmentVariableStore();
  let dashboardClientMock: Mock<StrykerDashboardClient>;
  let ciProviderMock: Mock<CIProvider>;
  const STRYKER_DASHBOARD_API_KEY = 'STRYKER_DASHBOARD_API_KEY';
  const apiKey = '123-abc-xyz';

  beforeEach(() => {
    dashboardClientMock = mock(StrykerDashboardClient);
    environmentVariableStore.set(STRYKER_DASHBOARD_API_KEY, apiKey);
    ciProviderMock = {
      determineSlug: sinon.stub(),
      determineVersion: sinon.stub(),
      isPullRequest: sinon.stub()
    };
  });

  afterEach(() => {
    environmentVariableStore.restore();
  });

  function createSut(ciProviderOverride: CIProvider | null = ciProviderMock) {
    return testInjector.injector
      .provideValue(dashboardReporterTokens.dashboardReporterClient, (dashboardClientMock as unknown) as DashboardReporterClient)
      .provideValue(dashboardReporterTokens.ciProvider, ciProviderOverride)
      .injectClass(DashboardReporter);
  }

  it('should log an info if it is a pull request', async () => {
    // Arrange
    ciProviderMock.isPullRequest.returns(true);

    // Act
    await createSut().onMutationTestReportReady(mutationTestReportSchemaMutationTestResult());

    // Assert
    expect(dashboardClientMock.postMutationScoreReport).to.have.not.been.called;
    expect(testInjector.logger.info).to.have.been.calledWithMatch('Dashboard mutation score is not sent when building a pull request');
  });

  it('should throw when Stryker API key is unknown', async () => {
    // Arrange
    environmentVariableStore.unset(STRYKER_DASHBOARD_API_KEY);

    // Act
    const promise = createSut().onMutationTestReportReady(mutationTestReportSchemaMutationTestResult());

    // Assert
    await expect(promise).rejectedWith('Missing environment variable "STRYKER_DASHBOARD_API_KEY"');
    expect(dashboardClientMock.postMutationScoreReport).to.have.not.been.called;
  });

  describe('with a mutation score report', () => {
    it('should report mutation score to report server', async () => {
      // Arrange
      ciProviderMock.isPullRequest.returns(false);
      ciProviderMock.determineSlug.returns('github.com/foo/bar');
      ciProviderMock.determineVersion.returns('master');

      // Act
      await createSut().onMutationTestReportReady(
        mutationTestReportSchemaMutationTestResult({
          files: {
            'a.js': mutationTestReportSchemaFileResult({
              mutants: [
                mutationTestReportSchemaMutantResult({ status: mutationTestReportSchema.MutantStatus.Killed }),
                mutationTestReportSchemaMutantResult({ status: mutationTestReportSchema.MutantStatus.Killed }),
                mutationTestReportSchemaMutantResult({ status: mutationTestReportSchema.MutantStatus.Killed }),
                mutationTestReportSchemaMutantResult({ status: mutationTestReportSchema.MutantStatus.Survived })
              ]
            })
          }
        })
      );

      // Assert
      const report: MutationScoreReport = {
        apiKey,
        branch: 'master',
        mutationScore: 75,
        repositorySlug: 'github.com/foo/bar'
      };

      expect(dashboardClientMock.postMutationScoreReport).calledWith(report);
      expect(testInjector.logger.warn).not.called;
    });

    it('should log an info if it is not part of a CI build', async () => {
      // Arrange
      const sut = createSut(null);

      // Act
      await sut.onMutationTestReportReady(mutationTestReportSchemaMutationTestResult());

      // Assert
      expect(dashboardClientMock.postMutationScoreReport).not.called;
      expect(testInjector.logger.info).calledWithMatch('Dashboard report is not sent when not running on a build server');
    });
  });

  describe('with a full report', () => {
    beforeEach(() => {
      testInjector.options.experimentalFullReport = true;
    });

    it('should send the full report and log the resulting href', async () => {
      // Arrange
      const expectedRepositorySlug = 'foo.org/bar/baz';
      const expectedVersion = 'develop';
      ciProviderMock.determineSlug.returns(expectedRepositorySlug);
      ciProviderMock.determineVersion.returns(expectedVersion);
      const expectedReport = mutationTestReportSchemaMutationTestResult();
      dashboardClientMock.putFullResult.resolves('location/of/report');

      // Act
      await createSut().onMutationTestReportReady(expectedReport);

      // Assert
      expect(testInjector.logger.info).calledWith('Report available at: %s', 'location/of/report');
      expect(dashboardClientMock.putFullResult).calledWith({
        apiKey,
        moduleName: null,
        report: expectedReport,
        repositorySlug: expectedRepositorySlug,
        version: expectedVersion
      });
    });

    it('should send include moduleName if one is configured', async () => {
      // Arrange
      const expectedRepositorySlug = 'foo.org/bar/baz';
      const expectedVersion = 'develop';
      const expectedReport = mutationTestReportSchemaMutationTestResult();
      const expectedModuleName = 'module-1';
      ciProviderMock.determineSlug.returns(expectedRepositorySlug);
      ciProviderMock.determineVersion.returns(expectedVersion);
      dashboardClientMock.putFullResult.resolves('location/of/report');
      testInjector.options.moduleName = expectedModuleName;

      // Act
      await createSut().onMutationTestReportReady(expectedReport);

      // Assert
      expect(dashboardClientMock.putFullResult).calledWith({
        apiKey,
        moduleName: expectedModuleName,
        report: expectedReport,
        repositorySlug: expectedRepositorySlug,
        version: expectedVersion
      });
    });

    it('should log an error if the dashboardClient rejects in an error', async () => {
      // Arrange
      const expectedReport = mutationTestReportSchemaMutationTestResult();
      const expectedError = new Error('Expected error for putFullResult');
      dashboardClientMock.putFullResult.rejects(expectedError);
      ciProviderMock.determineSlug.returns('slug');
      ciProviderMock.determineVersion.returns('version');

      // Act
      await createSut().onMutationTestReportReady(expectedReport);

      // Assert
      expect(testInjector.logger.error).calledWith('Could not upload report.', expectedError);
    });
  });
});
