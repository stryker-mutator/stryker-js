import * as log4js from 'log4js';
import { expect } from 'chai';
import { LogLevel } from 'stryker-api/core';
import LogConfigurator from '../../../src/logging/LogConfigurator';
import * as netUtils from '../../../src/utils/netUtils';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';

describe('LogConfigurator', () => {

  const sut = LogConfigurator;
  let getFreePortStub: sinon.SinonStub;
  let log4jsConfigure: sinon.SinonStub;
  let log4jsShutdown: sinon.SinonStub;

  beforeEach(() => {
    getFreePortStub = sandbox.stub(netUtils, 'getFreePort');
    log4jsConfigure = sandbox.stub(log4js, 'configure');
    log4jsShutdown = sandbox.stub(log4js, 'shutdown');
  });

  describe('configureMainProcess', () => {
    it('should configure console and file', () => {
      sut.configureMainProcess(LogLevel.Information, LogLevel.Trace);
      expect(log4jsConfigure).calledWith(createMasterConfig(LogLevel.Information, LogLevel.Trace, LogLevel.Trace));
    });

    it('should not configure file if it is "off"', () => {
      sut.configureMainProcess(LogLevel.Information, LogLevel.Off);
      const masterConfig = createMasterConfig(LogLevel.Information, LogLevel.Off, LogLevel.Information);
      delete masterConfig.appenders.file;
      delete masterConfig.appenders.filteredFile;
      (masterConfig.appenders.all as any).appenders = ['filteredConsole'];
      expect(log4jsConfigure).calledWith(masterConfig);
    });
  });

  describe('configureLoggingServer', () => {
    it('should configure console, file and server', async () => {
      // Arrange
      const expectedLoggingContext: LoggingClientContext = { port: 42, level: LogLevel.Error };
      getFreePortStub.resolves(expectedLoggingContext.port);
      const expectedConfig = createMasterConfig(LogLevel.Error, LogLevel.Fatal, LogLevel.Error);
      const serverAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'master', loggerPort: 42, appender: 'all' };
      expectedConfig.appenders.server = serverAppender;

      // Act
      const actualLoggingContext = await sut.configureLoggingServer(LogLevel.Error, LogLevel.Fatal);

      // Assert
      expect(log4jsConfigure).calledWith(expectedConfig);
      expect(getFreePortStub).called;
      expect(actualLoggingContext).deep.eq(expectedLoggingContext);
    });

  });

  describe('configureChildProcess', () => {
    it('should configure the logging client', () => {
      sut.configureChildProcess({ port: 42, level: LogLevel.Information });
      const multiProcessAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'worker', loggerPort: 42 };
      const expectedConfig: log4js.Configuration = {
        appenders: {
          all: multiProcessAppender
        },
        categories: {
          default: { level: LogLevel.Information, appenders: ['all'] }
        }
      };
      expect(log4jsConfigure).calledWith(expectedConfig);
    });
  });

  describe('shutdown', () => {
    it('should shutdown log4js', async () => {
      log4jsShutdown.callsArg(0);
      await sut.shutdown();
      expect(log4jsShutdown).called;
    });
  });

  function createMasterConfig(consoleLevel: LogLevel, fileLevel: LogLevel, defaultLevel: LogLevel): log4js.Configuration {
    const coloredLayout: log4js.PatternLayout = {
      pattern: '%[%r (%z) %p %c%] %m',
      type: 'pattern'
    };
    const notColoredLayout: log4js.PatternLayout  = {
      pattern: '%r (%z) %p %c %m',
      type: 'pattern'
    };
    return {
      appenders: {
        all: { type: require.resolve('../../../src/logging/MultiAppender'), appenders: ['filteredConsole', 'filteredFile'] },
        console: { type: 'stdout', layout: coloredLayout },
        file: { type: 'file', layout: notColoredLayout, filename: 'stryker.log' },
        filteredConsole: { type: 'logLevelFilter', appender: 'console', level: consoleLevel },
        filteredFile: { type: 'logLevelFilter', appender: 'file', level: fileLevel }
      },
      categories: {
        default: { level: defaultLevel, appenders: ['all'] }
      }
    };
  }
});
