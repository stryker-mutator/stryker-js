import sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
import { LoggingServer } from '../../../src/logging/logging-server.js';
import { LoggingSink } from '../../../src/logging/logging-sink.js';
import { coreTokens } from '../../../src/di/index.js';
import { LoggingClient } from '../../../src/logging/logging-client.js';
import { LogLevel } from '@stryker-mutator/api/core';
import { LoggingEvent } from '../../../src/logging/logging-event.js';
import { expect } from 'chai';
import { sleep } from '../../helpers/test-utils.js';

describe('Logging server integration', () => {
  it('should be able to receive log events from clients', async () => {
    // Arrange
    const loggingSink: sinon.SinonStubbedInstance<LoggingSink> = {
      isEnabled: sinon.stub(),
      log: sinon.stub(),
    };
    const serverInjector = testInjector.injector
      .provideValue(coreTokens.loggingSink, loggingSink)
      .provideClass(coreTokens.loggingSink, LoggingServer);
    const logServer = serverInjector.resolve(coreTokens.loggingSink);
    const address = await logServer.listen();
    const clientInjector = testInjector.injector
      .provideValue(coreTokens.loggerActiveLevel, LogLevel.Information)
      .provideValue(coreTokens.loggingServerAddress, address)
      .provideClass(coreTokens.loggingSink, LoggingClient);
    const client = clientInjector.resolve(coreTokens.loggingSink);
    await client.openConnection();

    // Act
    const expectedError = new Error('expected');
    const actualLogEvent = LoggingEvent.create('Foo Category', LogLevel.Information, ['bar', expectedError]);
    client.log(actualLogEvent);

    // Assert
    let attempt = 0;
    while (true) {
      try {
        expect(loggingSink.log).calledWith(LoggingEvent.deserialize(actualLogEvent.serialize()));
        break;
      } catch (error) {
        if (attempt > 10) {
          throw error;
        }
        await sleep();
        attempt++;
      };
    }
  });
});
