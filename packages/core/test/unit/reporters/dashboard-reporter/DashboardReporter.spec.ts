import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { testInjector } from '@stryker-mutator/test-helpers';
import {
  mutationTestReportSchemaFileResult,
  mutationTestReportSchemaMutantResult,
  mutationTestReportSchemaMutationTestResult
} from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ReportType } from '@stryker-mutator/api/core';

import { CIProvider } from '../../../../src/reporters/ci/Provider';
import DashboardReporter from '../../../../src/reporters/dashboard-reporter/DashboardReporter';
import {
  default as DashboardReporterClient,
  default as StrykerDashboardClient
} from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens';
import { mock, Mock } from '../../../helpers/producers';
import { Report } from '../../../../src/reporters/dashboard-reporter/Report';

describe(DashboardReporter.name, () => {
  let dashboardClientMock: Mock<StrykerDashboardClient>;
  let ciProviderMock: Mock<CIProvider>;

  beforeEach(() => {
    dashboardClientMock = mock(StrykerDashboardClient);
    ciProviderMock = {
      determineProject: sinon.stub(),
      determineVersion: sinon.stub()
    };
  });

  function createSut(ciProviderOverride: CIProvider | null = ciProviderMock) {
    return testInjector.injector
      .provideValue(dashboardReporterTokens.dashboardReporterClient, (dashboardClientMock as unknown) as DashboardReporterClient)
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
    await act(mutationTestReportSchemaMutationTestResult());

    // Assert
    expect(dashboardClientMock.updateReport).calledWithMatch({
      projectName: 'fooProject',
      version: 'barVersion',
      moduleName: 'bazModule'
    });
  });

  it('should a update a full report if reportType = "full"', async () => {
    // Arrange
    testInjector.options.dashboard.reportType = ReportType.Full;
    ciProviderMock.determineProject.returns('github.com/foo/bar');
    ciProviderMock.determineVersion.returns('master');
    const expectedMutationTestResult = mutationTestReportSchemaMutationTestResult();
    const expectedReport: Report = {
      result: expectedMutationTestResult
    };

    // Act
    await act(expectedMutationTestResult);

    // Assert
    expect(dashboardClientMock.updateReport).calledWith({
      report: expectedReport,
      projectName: 'github.com/foo/bar',
      version: 'master',
      moduleName: undefined
    });
    expect(testInjector.logger.warn).not.called;
  });

  it('should a update a mutation score if reportType = "mutationScore', async () => {
    // Arrange
    testInjector.options.dashboard.reportType = ReportType.MutationScore;
    ciProviderMock.determineProject.returns('github.com/foo/bar');
    ciProviderMock.determineVersion.returns('master');
    const mutationTestResult = mutationTestReportSchemaMutationTestResult({
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
    });
    const expectedReport: Report = {
      mutationScore: 75
    };

    // Act
    await act(mutationTestResult);

    // Assert
    expect(dashboardClientMock.updateReport).calledWith({
      report: expectedReport,
      projectName: 'github.com/foo/bar',
      version: 'master',
      moduleName: undefined
    });
    expect(testInjector.logger.warn).not.called;
  });

  it('should log an info if no settings and no ci provider', async () => {
    // Arrange
    const sut = createSut(null);

    // Act
    sut.onMutationTestReportReady(mutationTestReportSchemaMutationTestResult());
    await sut.wrapUp();

    // Assert
    expect(dashboardClientMock.updateReport).not.called;
    expect(testInjector.logger.info).calledWithMatch(
      'The report was not send to the dashboard. The dashboard.project and/or dashboard.version values were missing and not detected to be running on a build server'
    );
  });

  async function act(result: mutationTestReportSchema.MutationTestResult) {
    const sut = createSut();
    sut.onMutationTestReportReady(result);
    await sut.wrapUp();
  }
});
