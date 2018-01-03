import StrykerDashboardClient from '../../../../src/reporters/DashboardReporter/DashboardReporterClient';
import { StrykerDashboardReport } from '../../../../src/reporters/DashboardReporter/DashboardReporterClient';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { Mock, mock } from '../../../helpers/producers';
import { expect } from 'chai';
import { Logger } from 'log4js';
import currentLogMock from '../../../helpers/log4jsMock';

describe('DashboardReporterClient', () => {

  let sut: StrykerDashboardClient;
  let dashboardClient: Mock<HttpClient>;
  let log: Mock<Logger>;

  const url = 'https://badge.stryker-mutator.io/';

  const dashboardReport: StrykerDashboardReport = {
    apiKey: '1',
    repositorySlug: 'github/stryker-mutator/stryker',
    branch: 'master',
    mutationScore: 65.1,
    reportData: null
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

  it('when the server returns a invalid statuscode an error will be logged  ', async () => {
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

  it('when the server doesnt respond an error will be logged', async () => {
    // Arrange
    dashboardClient.post.rejects({ 
    });

    // Act
    await sut.postStrykerDashboardReport(dashboardReport);

    // Assert
    expect(log.error).have.been.calledWithMatch(`Unable to reach ${url}. Please check your internet connection.`);
  });
});
