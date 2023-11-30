import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { ReportType, schema } from '@stryker-mutator/api/core';

import { calculateMutationTestMetrics } from 'mutation-testing-metrics';

import { CIProvider } from '../../../../src/reporters/ci/provider.js';
import { DashboardReporter } from '../../../../src/reporters/dashboard-reporter/dashboard-reporter.js';
import { DashboardReporterClient } from '../../../../src/reporters/dashboard-reporter/dashboard-reporter-client.js';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens.js';
import { mock, Mock } from '../../../helpers/producers.js';
import { Report } from '../../../../src/reporters/dashboard-reporter/report.js';

describe(DashboardReporter.name, () => {
  let dashboardClientMock: Mock<DashboardReporterClient>;
  let ciProviderMock: Mock<CIProvider>;

  beforeEach(() => {
    dashboardClientMock = mock(DashboardReporterClient);
    ciProviderMock = {
      determineProject: sinon.stub(),
      determineVersion: sinon.stub(),
    };
  });

  function createSut(ciProviderOverride: CIProvider | null = ciProviderMock) {
    return testInjector.injector
      .provideValue(dashboardReporterTokens.dashboardReporterClient, dashboardClientMock as unknown as DashboardReporterClient)
      .provideValue(dashboardReporterTokens.ciProvider, ciProviderOverride)
      .injectClass(DashboardReporter);
  }

  it('should use the dashboard options if they are available', async () => {
    // Arrange
    ciProviderMock.determineProject.returns('github.com/foo/bar');
    ciProviderMock.determineVersion.returns('master');
    testInjector.options.dashboard.project = 'fooProject';
    testInjector.options.dashboard.version = 'barVersion';
    testInjector.options.dashboard.module = 'bazModule';

    // Act
    await act(factory.mutationTestReportSchemaMutationTestResult());

    // Assert
    expect(dashboardClientMock.updateReport).calledWithMatch({
      projectName: 'fooProject',
      version: 'barVersion',
      moduleName: 'bazModule',
    });
  });

  it('should a update a full report if reportType = "full"', async () => {
    // Arrange
    testInjector.options.dashboard.reportType = ReportType.Full;
    ciProviderMock.determineProject.returns('github.com/foo/bar');
    ciProviderMock.determineVersion.returns('master');
    const expectedMutationTestResult = factory.mutationTestReportSchemaMutationTestResult();

    // Act
    await act(expectedMutationTestResult);

    // Assert
    expect(dashboardClientMock.updateReport).calledWith({
      report: expectedMutationTestResult,
      projectName: 'github.com/foo/bar',
      version: 'master',
      moduleName: undefined,
    });
    expect(testInjector.logger.warn).not.called;
  });

  it('should a update a mutation score if reportType = "mutationScore', async () => {
    // Arrange
    testInjector.options.dashboard.reportType = ReportType.MutationScore;
    ciProviderMock.determineProject.returns('github.com/foo/bar');
    ciProviderMock.determineVersion.returns('master');
    const mutationTestResult = factory.mutationTestReportSchemaMutationTestResult({
      files: {
        'a.js': factory.mutationTestReportSchemaFileResult({
          mutants: [
            factory.mutationTestReportSchemaMutantResult({ status: 'Killed' }),
            factory.mutationTestReportSchemaMutantResult({ status: 'Killed' }),
            factory.mutationTestReportSchemaMutantResult({ status: 'Killed' }),
            factory.mutationTestReportSchemaMutantResult({ status: 'Survived' }),
          ],
        }),
      },
    });
    const expectedReport: Report = {
      mutationScore: 75,
    };

    // Act
    await act(mutationTestResult);

    // Assert
    expect(dashboardClientMock.updateReport).calledWith({
      report: expectedReport,
      projectName: 'github.com/foo/bar',
      version: 'master',
      moduleName: undefined,
    });
    expect(testInjector.logger.warn).not.called;
  });

  it('should log an info if no settings and no ci provider', async () => {
    // Arrange
    const sut = createSut(null);

    // Act
    sut.onMutationTestReportReady(factory.mutationTestReportSchemaMutationTestResult(), factory.mutationTestMetricsResult());
    await sut.wrapUp();

    // Assert
    expect(dashboardClientMock.updateReport).not.called;
    expect(testInjector.logger.info).calledWithMatch(
      'The report was not send to the dashboard. The dashboard.project and/or dashboard.version values were missing and not detected to be running on a build server',
    );
  });

  async function act(result: schema.MutationTestResult) {
    const sut = createSut();
    sut.onMutationTestReportReady(result, calculateMutationTestMetrics(result));
    await sut.wrapUp();
  }
});
