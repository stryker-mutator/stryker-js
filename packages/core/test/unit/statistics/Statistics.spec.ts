import { Statistics } from '../../../src/statistics/Statistics';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { testInjector } from '@stryker-mutator/test-helpers';
import { Mock, mock } from '../../helpers/producers';
import { expect } from 'chai';

describe.only('Statistics', () => {
  let sut: Statistics;
  let httpStatisticsClient: Mock<HttpClient>;

  const AZURE_URL = 'https://localstrykertryout.azurewebsites.net/api/HttpTrigger?code=4GWK/KLC6JRlec96851wMgMsD2JkVePiaALWw6lKv4R3RZiKf0xp0w==';
  const statisticsData = {
    implementation: 'Stryker'
  };
  const contentType = {
    ['Content-Type']: 'application/json'
  };

  beforeEach(() => {
    httpStatisticsClient = mock(HttpClient);
    sut = testInjector.injector.provideValue('httpClient', (httpStatisticsClient as unknown) as HttpClient).injectClass(Statistics);
  });

  it('report implementation to statistics server', async () => {
    // Arrange
    httpStatisticsClient.post.resolves({
      message: {
        statusCode: 201
      }
    });

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.info).have.been.calledWithMatch(`Sending anonymous statistics to ${AZURE_URL}`);
    expect(httpStatisticsClient.post).have.been.calledWith(AZURE_URL, JSON.stringify(statisticsData), contentType);
    expect(testInjector.logger.error).have.not.been.called;
  });

  it('server returns invalid status code', async () => {
    // Arrange
    httpStatisticsClient.post.resolves({
      message: {
        statusCode: 600
      }
    });

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.error).have.been.calledWithMatch('Sending statistics resulted in http status 600');
  });

  it("server doesn't respond", async () => {
    // Arrange
    httpStatisticsClient.post.rejects();

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.error).have.been.calledWithMatch('Unable to reach statistics server');
  });
});
