import StrykerDashboardClient, { StrykerDashboardReport } from '../../../../src/reporters/dashboard-reporter/DashboardReporterClient';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { Mock, mock } from '../../../helpers/producers';
import { expect } from 'chai';
import { Logger } from 'stryker-api/logging';
import currentLogMock from '../../../helpers/logMock';

describe('DashboardReporterClient', () => {

  let sut: StrykerDashboardClient;
  let dashboardClient: Mock<HttpClient>;
  let log: Mock<Logger>;

  const url = 'https://dashboard.stryker-mutator.io/api/reports';

  const dashboardReport: StrykerDashboardReport = {
    apiKey: '1',
    branch: 'master',
    mutationScore: 65.1,
    repositorySlug: 'github.com/stryker-mutator/stryker'
  };

  beforeEach(() => {
    dashboardClient = mock(HttpClient);
    sut = new StrykerDashboardClient(dashboardClient as any);
    log = currentLogMock();
  });

  it('report mutations score to dashboard server', async () => {
      // Arrange
      dashboardClient.post.resolves({
        message: {
          statusCode: 201
        }
      });

      // Act
      await sut.postStrykerDashboardReport(dashboardReport);

      // Assert
      const report = JSON.stringify(dashboardReport);
      const contentType = {
        ['Content-Type']: 'application/json'
      };

      expect(log.info).have.been.calledWithMatch(`Posting report to ${url}`);
      expect(dashboardClient.post).have.been.calledWith(url, report, contentType);
      expect(log.error).have.not.been.called;
  });

  it('when the server returns a invalid status code an error will be logged  ', async () => {
    // Arrange
    dashboardClient.post.resolves({
      message: {
        statusCode: 500
      }
    });

    // Act
    await sut.postStrykerDashboardReport(dashboardReport);

    // Assert
    expect(log.error).have.been.calledWithMatch(`Post to ${url} resulted in http status code: 500`);
  });

  it('when the server doesn\'t respond an error will be logged', async () => {
    // Arrange
    dashboardClient.post.rejects();

    // Act
    await sut.postStrykerDashboardReport(dashboardReport);

    // Assert
    expect(log.error).have.been.calledWithMatch(`Unable to reach ${url}. Please check your internet connection.`);
  });
});
