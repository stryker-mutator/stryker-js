import sinon from 'sinon';
import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens, Injector } from '@stryker-mutator/api/plugin';
import {
  LoggingBackend,
  LoggingSink,
  provideLogging,
  provideLoggingBackend,
  provideLoggingClient,
} from '../../../src/logging/index.js';
import { coreTokens } from '../../../src/di/index.js';
import {
  LoggingServer,
  LoggingServerAddress,
} from '../../../src/logging/logging-server.js';
import { LoggingClient } from '../../../src/logging/logging-client.js';
import { LogLevel } from '@stryker-mutator/api/core';

describe('Provide logging', () => {
  describe(provideLoggingBackend.name, () => {
    let injectorMock: sinon.SinonStubbedInstance<
      Injector<
        ReturnType<typeof provideLoggingBackend> & {
          [coreTokens.loggingServer]: LoggingServer;
        }
      >
    >;
    let loggingServerMock: sinon.SinonStubbedInstance<LoggingServer>;
    beforeEach(() => {
      injectorMock = factory.injector();
      loggingServerMock = sinon.createStubInstance(LoggingServer);
      injectorMock.resolve
        .withArgs(coreTokens.loggingServer)
        .returns(loggingServerMock);
    });

    it('should provide a logging backend', async () => {
      // Act
      const result = await provideLoggingBackend(injectorMock);

      // Assert
      expect(result).eq(injectorMock);
      sinon.assert.calledWithExactly(
        injectorMock.provideClass,
        coreTokens.loggingSink,
        LoggingBackend,
      );
    });
    it('should open the logging server and provide the address', async () => {
      // Arrange
      const expectedAddress: LoggingServerAddress = { port: 42 };
      loggingServerMock.listen.resolves(expectedAddress);

      // Act
      await provideLoggingBackend(injectorMock);

      // Assert
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.loggingServerAddress,
        expectedAddress,
      );
    });
  });

  describe(provideLoggingClient.name, () => {
    let injectorMock: sinon.SinonStubbedInstance<
      Awaited<ReturnType<typeof provideLoggingClient>>
    >;
    let loggingClientMock: sinon.SinonStubbedInstance<LoggingClient>;
    beforeEach(() => {
      injectorMock = factory.injector();
      loggingClientMock = sinon.createStubInstance(LoggingClient);
      injectorMock.resolve
        .withArgs(coreTokens.loggingSink)
        .returns(loggingClientMock);
    });

    it('should provide a logging client', async () => {
      // Arrange
      const loggingServerAddress = { port: 42 };
      const activeLogLevel = LogLevel.Error;

      // Act
      const result = await provideLoggingClient(
        injectorMock,
        loggingServerAddress,
        activeLogLevel,
      );

      // Assert
      expect(result).eq(injectorMock);
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.loggingServerAddress,
        loggingServerAddress,
      );
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.loggerActiveLevel,
        activeLogLevel,
      );
    });

    it('should open the connection', async () => {
      // Act
      await provideLoggingClient(injectorMock, { port: 42 }, LogLevel.Error);

      // Assert
      sinon.assert.called(loggingClientMock.openConnection);
    });
  });

  describe(provideLogging.name, () => {
    let loggingSinkMock: sinon.SinonStubbedInstance<LoggingSink>;

    beforeEach(() => {
      loggingSinkMock = {
        isEnabled: sinon.stub(),
        log: sinon.stub(),
      };
    });

    function createInjector() {
      return testInjector.injector.provideValue(
        coreTokens.loggingSink,
        loggingSinkMock,
      );
    }

    it('should provide a logger factory', () => {
      const actualInjector = provideLogging(createInjector());
      const getLogger = actualInjector.resolve(commonTokens.getLogger);
      const logger = getLogger('foo');
      logger.info('bar');
      sinon.assert.calledWith(
        loggingSinkMock.log,
        sinon.match({
          level: LogLevel.Information,
          data: ['bar'],
          categoryName: 'foo',
        }),
      );
    });

    it('should provide a logger', () => {
      const actualInjector = provideLogging(createInjector());
      const logger = actualInjector.resolve(commonTokens.logger);
      logger.info('bar');
      sinon.assert.calledWith(
        loggingSinkMock.log,
        sinon.match({
          level: LogLevel.Information,
          data: ['bar'],
          categoryName: 'UNKNOWN',
        }),
      );
    });
  });
});
