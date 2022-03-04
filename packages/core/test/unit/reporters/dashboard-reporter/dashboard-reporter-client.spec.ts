import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { HttpClient } from 'typed-rest-client/HttpClient.js';
import { IHttpClientResponse } from 'typed-rest-client/Interfaces';

import { DashboardReporterClient } from '../../../../src/reporters/dashboard-reporter/dashboard-reporter-client.js';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens.js';
import { Mock, mock } from '../../../helpers/producers.js';
import { Report } from '../../../../src/reporters/dashboard-reporter/report.js';
import { EnvironmentVariableStore } from '../../../helpers/environment-variable-store.js';

describe(DashboardReporterClient.name, () => {
  let sut: DashboardReporterClient;
  let httpClient: Mock<HttpClient>;
  let environment: EnvironmentVariableStore;

  const baseUrl = 'https://dashboard.stryker-mutator.io/api/reports';

  beforeEach(() => {
    environment = new EnvironmentVariableStore();
    httpClient = mock(HttpClient);
    sut = testInjector.injector
      .provideValue(dashboardReporterTokens.httpClient, httpClient as unknown as HttpClient)
      .injectClass(DashboardReporterClient);
  });

  afterEach(() => {
    environment.restore();
  });

  describe(DashboardReporterClient.prototype.updateReport.name, () => {
    const apiKey = 'an api key';
    const version = 'feat/foo-bar';
    const expectedVersion = encodeURIComponent(version);
    const projectName = 'github.com/repo/slug';

    it('should put the report and respond with the href', async () => {
      // Arrange
      const expectedHref = 'foo/bar';
      respondWith(200, `{ "href": "${expectedHref}" }`);
      environment.set('STRYKER_DASHBOARD_API_KEY', apiKey);
      const report = factory.mutationTestReportSchemaMutationTestResult();
      const expectedBody = JSON.stringify(report);
      const expectedUrl = `${baseUrl}/${projectName}/${expectedVersion}`;

      // Act
      const actualHref = await sut.updateReport({ projectName, report, version, moduleName: undefined });

      // Assert
      expect(actualHref).eq(expectedHref);
      expect(httpClient.put).calledWith(expectedUrl, expectedBody, {
        ['X-Api-Key']: apiKey,
        ['Content-Type']: 'application/json',
      });
      expect(testInjector.logger.info).calledWith('PUT report to %s (~%s bytes)', expectedUrl, expectedBody.length);
      expect(testInjector.logger.debug).calledWith('Using configured API key from environment "%s"', 'STRYKER_DASHBOARD_API_KEY');
      expect(testInjector.logger.trace).calledWith('PUT report %s', expectedBody);
    });

    it('should put the report for a specific module', async () => {
      // Arrange
      respondWith();
      const report = factory.mutationTestReportSchemaMutationTestResult();
      const expectedUrl = `${baseUrl}/${projectName}/${expectedVersion}?module=stryker%20module`;

      // Act
      await sut.updateReport({ projectName: projectName, report, version, moduleName: 'stryker module' });

      // Assert
      expect(httpClient.put).calledWith(expectedUrl);
    });

    it('should use configured baseUrl', async () => {
      // Arrange
      respondWith();
      const report = factory.mutationTestReportSchemaMutationTestResult();
      testInjector.options.dashboard.baseUrl = 'https://foo.bar.com/api';
      const expectedUrl = `https://foo.bar.com/api/${projectName}/${expectedVersion}?module=stryker%20module`;

      // Act
      await sut.updateReport({ projectName: projectName, report, version, moduleName: 'stryker module' });

      // Assert
      expect(httpClient.put).calledWith(expectedUrl);
    });

    it('should throw an Unauthorized error if the dashboard responds with 401', async () => {
      // Arrange
      respondWith(401);
      const report: Report = {
        mutationScore: 58,
      };

      // Act
      const promise = sut.updateReport({ report, projectName: projectName, version, moduleName: undefined });

      // Assert
      await expect(promise).rejectedWith(
        `Error HTTP PUT ${baseUrl}/${projectName}/${expectedVersion}. Unauthorized. Did you provide the correct api key in the "STRYKER_DASHBOARD_API_KEY" environment variable?`
      );
    });

    it('should throw an unexpected error if the dashboard responds with 500', async () => {
      // Arrange
      respondWith(500, 'Internal server error');
      const report = factory.mutationTestReportSchemaMutationTestResult();

      // Act
      const promise = sut.updateReport({ report, projectName, version, moduleName: undefined });

      // Assert
      await expect(promise).rejectedWith(
        `Error HTTP PUT ${baseUrl}/${projectName}/${expectedVersion}. Response status code: 500. Response body: Internal server error`
      );
    });
  });

  function respondWith(statusCode = 200, body = '{ "href": "href" }') {
    httpClient.put.resolves({
      message: {
        statusCode,
      },
      readBody: sinon.stub().resolves(body),
    } as unknown as IHttpClientResponse);
  }
});
