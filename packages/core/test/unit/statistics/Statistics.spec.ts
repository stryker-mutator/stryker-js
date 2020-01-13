import { IncomingMessage } from 'http';
import { Socket } from 'net';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';

import { Statistics } from '../../../src/statistics/Statistics';
import { JsonLoader } from '../../../src/statistics/JsonLoader';
import { Mock, mock } from '../../helpers/producers';

describe('Statistics', () => {
  let sut: Statistics;
  let httpClientMock: Mock<HttpClient>;

  const AZURE_URL = 'https://strykerstatistics.azurewebsites.net/api/ReceiveStatistics?code=jVZfGmoB6ofRPa/yPdN/mAOCd6ia67XQkTmLaGWCzlxO5a32PlLj6A==';
  const statisticsData = {
    implementation: 'Stryker',
    version: '1.0.0'
  };

  const contentType = {
    ['Content-Type']: 'application/json'
  };
  function createSut() {
    return testInjector.injector.provideValue(commonTokens.httpClient, (httpClientMock as unknown) as HttpClient).injectClass(Statistics);
  }

  beforeEach(() => {
    let packageMock = { version: '1.0.0' };
    sinon.stub(JsonLoader, 'loadFile').returns(packageMock);
    httpClientMock = mock(HttpClient);
    sut = createSut();
  });

  it('send implementation to statistics server', async () => {
    // Arrange
    const data = JSON.stringify(statisticsData);

    const incomingMessage = new IncomingMessage(new Socket());
    incomingMessage.statusCode = 201;
    httpClientMock.post.resolves(
      new Promise((resolve, reject) => {
        resolve(new HttpClientResponse(incomingMessage));
      })
    );

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.info).have.been.calledWithMatch(`Sending anonymous statistics to ${AZURE_URL}`);
    expect(httpClientMock.post).have.been.calledWith(AZURE_URL, data, contentType);
    expect(testInjector.logger.error).have.not.been.called;
    expect(testInjector.logger.warn).have.not.been.called;
  });

  it('server returns invalid status code', async () => {
    // Arrange
    const incomingMessage = new IncomingMessage(new Socket());
    incomingMessage.statusCode = 600;

    httpClientMock.post.resolves(
      new Promise((resolve, reject) => {
        resolve(new HttpClientResponse(incomingMessage));
      })
    );

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.warn).have.been.calledWithMatch('Sending statistics resulted in http status 600');
  });

  it("server doesn't respond", async () => {
    // Arrange
    const incomingMessage = new IncomingMessage(new Socket());
    incomingMessage.statusCode = 201;
    httpClientMock.post.resolves(
      new Promise((resolve, reject) => {
        resolve();
      })
    );

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.error).have.been.calledWithMatch('Unable to reach statistics server');
  });

  it('add statistic', () => {
    // Act
    sut.setStatistic('version', '9.9.9');

    // Assert
    expect(sut.getStatistic('version')).equal('9.9.9');
  });
});
