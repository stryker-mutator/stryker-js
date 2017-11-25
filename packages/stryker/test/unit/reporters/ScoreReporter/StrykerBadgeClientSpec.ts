import StrykerBadgeClient from '../../../../src/reporters/ScoreReporter/StrykerBadgeClient';
import { StrykerBadgeReport } from '../../../../src/reporters/ScoreReporter/StrykerBadgeClient';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { Mock, mock } from '../../../helpers/producers';
import { expect } from 'chai';
import { Logger } from 'log4js';
import currentLogMock from '../../../helpers/log4jsMock';

describe('StrykerBadgeClient', () => {

  let sut: StrykerBadgeClient;
  let badgeClient: Mock<HttpClient>;
  let log: Mock<Logger>;

  const badgeReport: StrykerBadgeReport = {
    api_key: '1',
    repository_slug: 'github/stryker-mutator/stryker',
    branch: 'master',
    mutation_score: 65.1,
    report_data: null
  };

  beforeEach(() => {
    badgeClient = mock(HttpClient);
    sut = new StrykerBadgeClient(badgeClient as any);
    log = currentLogMock();
  });

  it('Report mutations score to badge report server', async () => {
      // Arrange
      badgeClient.post.resolves({ 
        message: {
          statusCode: 201
        }
      });

      // Act
      await sut.postStrykerBadgeReport(badgeReport);

      // Assert
      const url = 'https://stryker-mutator-badge.azurewebsites.net/';
      const report = JSON.stringify(badgeReport);
      const contentType = {
        ['Content-Type']: 'application/json'
      };

      expect(log.debug).have.been.calledWithMatch(`Posting badge report to ${url}`);
      expect(badgeClient.post).have.been.calledWith(url, report, contentType);
      expect(log.error).have.not.been.called;
  });

  it('When the server returns a invalid statuscode an error will be logged  ', async () => {
    // Arrange
    badgeClient.post.resolves({ 
      message: {
        statusCode: 500
      }
    });

    // Act
    await sut.postStrykerBadgeReport(badgeReport);

    // Assert
    expect(log.error).have.been.calledWithMatch('Post to https://stryker-mutator-badge.azurewebsites.net/ resulted in http status code: 500');
  });

  it('When the server doesnt respon an error will be logged', async () => {
    // Arrange
    badgeClient.post.rejects({ 
    });

    // Act
    await sut.postStrykerBadgeReport(badgeReport);

    // Assert
    expect(log.error).have.been.calledWithMatch('Unable to reach https://stryker-mutator-badge.azurewebsites.net/. Please check your internet connection.');
  });
});
