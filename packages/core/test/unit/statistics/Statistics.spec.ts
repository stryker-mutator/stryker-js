import { IncomingMessage } from 'http';
import { Socket } from 'net';

import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { Statistics } from '../../../src/statistics/Statistics';
import { JsonLoader } from '../../../src/statistics/JsonLoader';

describe('Statistics', () => {
  let sut: Statistics;

  const AZURE_URL = 'https://strykerstatistics.azurewebsites.net/api/ReceiveStatistics?code=jVZfGmoB6ofRPa/yPdN/mAOCd6ia67XQkTmLaGWCzlxO5a32PlLj6A==';
  const statisticsData = {
    implementation: 'Stryker',
    version: '1.0.0'
  };

  const contentType = {
    ['Content-Type']: 'application/json'
  };

  beforeEach(() => {
    let packageMock = { version: '1.0.0' };
    sinon.stub(JsonLoader, 'loadFile').returns(packageMock);
    sut = testInjector.injector.injectClass(Statistics);
  });

  it('report implementation to statistics server', async () => {
    // Arrange
    const data = JSON.stringify(statisticsData);

    const incomingMessage = new IncomingMessage(new Socket());
    incomingMessage.statusCode = 201;
    sinon.stub(HttpClient.prototype, 'post').returns(
      new Promise((resolve, reject) => {
        resolve(new HttpClientResponse(incomingMessage));
      })
    );

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.info).have.been.calledWithMatch(`Sending anonymous statistics to ${AZURE_URL}`);
    expect(HttpClient.prototype.post).have.been.calledWith(AZURE_URL, data, contentType);
    expect(testInjector.logger.error).have.not.been.called;
    expect(testInjector.logger.warn).have.not.been.called;
  });

  it('server returns invalid status code', async () => {
    // Arrange
    const incomingMessage = new IncomingMessage(new Socket());
    incomingMessage.statusCode = 600;
    sinon.stub(HttpClient.prototype, 'post').returns(
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
    sinon.stub(HttpClient.prototype, 'post').returns(
      new Promise((resolve, reject) => {
        resolve();
      })
    );

    // Act
    await sut.sendStatistics();

    // Assert
    expect(testInjector.logger.error).have.been.calledWithMatch('Unable to reach statistics server');
  });
});
