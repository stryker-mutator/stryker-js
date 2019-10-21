import { testInjector } from '@stryker-mutator/test-helpers';
import { mutationTestReportSchemaMutationTestResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import sinon = require('sinon');
import { HttpClient } from 'typed-rest-client/HttpClient';
import StrykerDashboardClient, { MutationScoreReport } from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import DashboardReporterClient from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import { dashboardReporterTokens } from '../../../../src/reporters/dashboard-reporter/tokens';
import { Mock, mock } from '../../../helpers/producers';

describe(DashboardReporterClient.name, () => {
  let sut: StrykerDashboardClient;
  let httpClient: Mock<HttpClient>;

  const baseUrl = 'https://dashboard.stryker-mutator.io/api/reports';

  const dashboardReport: MutationScoreReport = {
    apiKey: '1',
    branch: 'master',
    mutationScore: 65.1,
    repositorySlug: 'github.com/stryker-mutator/stryker'
  };

  beforeEach(() => {
    httpClient = mock(HttpClient);
    sut = testInjector.injector
      .provideValue(dashboardReporterTokens.httpClient, (httpClient as unknown) as HttpClient)
      .injectClass(DashboardReporterClient);
  });

  describe(StrykerDashboardClient.prototype.postMutationScoreReport.name, () => {
    it('report mutations score to dashboard server', async () => {
      // Arrange
      httpClient.post.resolves({
        message: {
          statusCode: 201
        }
      });

      // Act
      await sut.postMutationScoreReport(dashboardReport);

      // Assert
      const report = JSON.stringify(dashboardReport);
      const contentType = {
        ['Content-Type']: 'application/json'
      };

      expect(testInjector.logger.info).have.been.calledWithMatch(`Posting report to ${baseUrl}`);
      expect(httpClient.post).have.been.calledWith(baseUrl, report, contentType);
      expect(testInjector.logger.error).have.not.been.called;
    });

    it('when the server returns a invalid status code an error will be logged  ', async () => {
      // Arrange
      httpClient.post.resolves({
        message: {
          statusCode: 500
        }
      });

      // Act
      await sut.postMutationScoreReport(dashboardReport);

      // Assert
      expect(testInjector.logger.error).have.been.calledWithMatch(`Post to ${baseUrl} resulted in http status code: 500`);
    });

    it("when the server doesn't respond an error will be logged", async () => {
      // Arrange
      httpClient.post.rejects();

      // Act
      await sut.postMutationScoreReport(dashboardReport);

      // Assert
      expect(testInjector.logger.error).have.been.calledWithMatch(`Unable to reach ${baseUrl}. Please check your internet connection.`);
    });
  });

  describe(DashboardReporterClient.prototype.putFullResult.name, () => {
    const apiKey = 'a api key';
    const version = 'master';
    const repositorySlug = 'github.com/repo/slug';

    it('should put the report and respond with the href', async () => {
      // Arrange
      const expectedHref = 'foo/bar';
      httpClient.put.resolves({
        message: {
          statusCode: 200
        },
        readBody: sinon.stub().resolves(`{ "href": "${expectedHref}" }`)
      });
      const report = mutationTestReportSchemaMutationTestResult();
      const expectedBody = JSON.stringify({ result: report });
      const expectedUrl = `${baseUrl}/${repositorySlug}/${version}`;

      // Act
      const actualHref = await sut.putFullResult({ repositorySlug, report, apiKey, version, moduleName: null });

      // Assert
      expect(actualHref).eq(expectedHref);
      expect(httpClient.put).calledWith(expectedUrl, expectedBody, {
        ['X-Api-Key']: apiKey,
        ['Content-Type']: 'application/json'
      });
      expect(testInjector.logger.info).calledWith('PUT report to %s (~%s bytes)', expectedUrl, expectedBody.length);
      expect(testInjector.logger.debug).calledWith('PUT report %s', expectedBody);
    });

    it('should put the report for a specific module', async () => {
      // Arrange
      httpClient.put.resolves({
        message: {
          statusCode: 200
        },
        readBody: sinon.stub().resolves('{ "href": "href" }')
      });
      const report = mutationTestReportSchemaMutationTestResult();
      const expectedUrl = `${baseUrl}/${repositorySlug}/${version}?module=stryker%20module`;

      // Act
      await sut.putFullResult({ repositorySlug, report, apiKey, version, moduleName: 'stryker module' });

      // Assert
      expect(httpClient.put).calledWith(expectedUrl);
    });

    it('should throw an Unauthorized error if the dashboard responds with 401', async () => {
      // Arrange
      httpClient.put.resolves({ message: { statusCode: 401 }, readBody: sinon.stub().resolves('Unauthorized') });
      const report = mutationTestReportSchemaMutationTestResult();

      // Act
      const promise = sut.putFullResult({ report, repositorySlug, apiKey, version, moduleName: null });

      // Assert
      await expect(promise).rejectedWith(
        `Error HTTP PUT ${baseUrl}/${repositorySlug}/${version}. Unauthorized. Did you provide the correct api key in the "STRYKER_DASHBOARD_API_KEY" environment variable?`
      );
    });

    it('should throw an unexpected error if the dashboard responds with 500', async () => {
      // Arrange
      httpClient.put.resolves({ message: { statusCode: 500 }, readBody: sinon.stub().resolves('Internal server error') });
      const report = mutationTestReportSchemaMutationTestResult();

      // Act
      const promise = sut.putFullResult({ report, repositorySlug, apiKey, version, moduleName: null });

      // Assert
      await expect(promise).rejectedWith(
        `Error HTTP PUT ${baseUrl}/${repositorySlug}/${version}. Response status code: 500. Response body: Internal server error`
      );
    });
  });
});
