import { HttpClient } from 'typed-rest-client/HttpClient';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { Statistics } from '../../../src/statistics/Statistics';
import { mock, Mock } from '../../helpers/producers';

describe('Statistics', () => {
  let sut: Statistics;
  let httpStatisticsClient: Mock<HttpClient>;

  const AZURE_URL = 'https://strykerstatistics.azurewebsites.net/api/ReceiveStatistics?code=jVZfGmoB6ofRPa/yPdN/mAOCd6ia67XQkTmLaGWCzlxO5a32PlLj6A==';
  // const statisticsData = {
  //   implementation: 'Stryker',
  //   version: '1.0.0'
  // };
  // const contentType = {
  //   ['Content-Type']: 'application/json'
  // };

  beforeEach(() => {
    httpStatisticsClient = mock(HttpClient);
    sut = testInjector.injector
      .provideValue('httpClient', (httpStatisticsClient as unknown) as HttpClient)
      .provideValue('testRunner', 'mocha')
      .injectClass(Statistics);
  });

  it('report implementation to statistics server', async () => {
    // Arrange
    //const data = JSON.stringify(statisticsData);
    httpStatisticsClient.post.resolves({
      message: {
        statusCode: 201
      }
    });

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.info).have.been.calledWithMatch(`Sending anonymous statistics to ${AZURE_URL}`);
    //expect(httpStatisticsClient.post).have.been.calledWith(AZURE_URL, data, contentType);
    expect(testInjector.logger.error).have.not.been.called;
    expect(testInjector.logger.warn).have.not.been.called;
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
    expect(testInjector.logger.warn).have.been.calledWithMatch('Sending statistics resulted in http status 600');
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
