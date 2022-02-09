import { fileURLToPath, URL } from 'url';

import { LogLevel } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import log4js from 'log4js';
import sinon from 'sinon';

import { LogConfigurator, LoggingClientContext } from '../../../src/logging/index.js';
import { netUtils } from '../../../src/utils/net-utils.js';

describe('LogConfigurator', () => {
  const sut = LogConfigurator;
  let getFreePortStub: sinon.SinonStub;
  let log4jsConfigure: sinon.SinonStub;
  let log4jsShutdown: sinon.SinonStub;

  beforeEach(() => {
    getFreePortStub = sinon.stub(netUtils, 'getFreePort');
    log4jsConfigure = sinon.stub(log4js, 'configure');
    log4jsShutdown = sinon.stub(log4js, 'shutdown');
  });

  describe('configureMainProcess', () => {
    it('should configure console, file and console color', () => {
      const allowConsoleColors = true;
      sut.configureMainProcess(LogLevel.Information, LogLevel.Trace, allowConsoleColors);
      expect(log4jsConfigure).calledWith(createMasterConfig(LogLevel.Information, LogLevel.Trace, LogLevel.Trace, allowConsoleColors));
    });

    it('should configure no colored console layout if `allowConsoleColors` is `false`', () => {
      const allowConsoleColors = false;
      sut.configureMainProcess(LogLevel.Information, LogLevel.Trace, allowConsoleColors);
      expect(log4jsConfigure).calledWith(createMasterConfig(LogLevel.Information, LogLevel.Trace, LogLevel.Trace, allowConsoleColors));
    });

    it('should not configure file if it is "off"', () => {
      const allowConsoleColors = true;
      sut.configureMainProcess(LogLevel.Information, LogLevel.Off, allowConsoleColors);
      const masterConfig = createMasterConfig(LogLevel.Information, LogLevel.Off, LogLevel.Information, allowConsoleColors);
      delete masterConfig.appenders.file;
      delete masterConfig.appenders.filterLevelFile;
      delete masterConfig.appenders.filterLog4jsCategoryFile;
      (masterConfig.appenders.all as any).appenders = ['filterLevelConsole'];
      expect(log4jsConfigure).calledWith(masterConfig);
    });
  });

  describe('configureLoggingServer', () => {
    it('should configure console, file, server and console color', async () => {
      // Arrange
      const allowConsoleColors = true;
      const expectedLoggingContext: LoggingClientContext = { port: 42, level: LogLevel.Error };
      getFreePortStub.resolves(expectedLoggingContext.port);
      const expectedConfig = createMasterConfig(LogLevel.Error, LogLevel.Fatal, LogLevel.Error, allowConsoleColors);
      const serverAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'master', loggerPort: 42, appender: 'all' };
      expectedConfig.appenders.server = serverAppender;

      // Act
      const actualLoggingContext = await sut.configureLoggingServer(LogLevel.Error, LogLevel.Fatal, allowConsoleColors);

      // Assert
      expect(log4jsConfigure).calledWith(expectedConfig);
      expect(getFreePortStub).called;
      expect(actualLoggingContext).deep.eq(expectedLoggingContext);
    });

    it('should configure no colored console layout if `allowConsoleColors` is `false`', async () => {
      // Arrange
      const allowConsoleColors = false;
      const expectedLoggingContext: LoggingClientContext = { port: 42, level: LogLevel.Error };
      getFreePortStub.resolves(expectedLoggingContext.port);
      const expectedConfig = createMasterConfig(LogLevel.Error, LogLevel.Fatal, LogLevel.Error, allowConsoleColors);
      const serverAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'master', loggerPort: 42, appender: 'all' };
      expectedConfig.appenders.server = serverAppender;

      // Act
      const actualLoggingContext = await sut.configureLoggingServer(LogLevel.Error, LogLevel.Fatal, allowConsoleColors);

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
          all: multiProcessAppender,
        },
        categories: {
          default: { level: LogLevel.Information, appenders: ['all'] },
        },
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

  function createMasterConfig(
    consoleLevel: LogLevel,
    fileLevel: LogLevel,
    defaultLevel: LogLevel,
    allowConsoleColors: boolean
  ): log4js.Configuration {
    const coloredLayout: log4js.PatternLayout = {
      pattern: '%[%r (%z) %p %c%] %m',
      type: 'pattern',
    };
    const notColoredLayout: log4js.PatternLayout = {
      pattern: '%r (%z) %p %c %m',
      type: 'pattern',
    };

    const consoleLayout = allowConsoleColors ? coloredLayout : notColoredLayout;
    return {
      appenders: {
        all: {
          type: fileURLToPath(new URL('../../../src/cjs/logging/multi-appender.js', import.meta.url)),
          appenders: ['filterLevelConsole', 'filterLevelFile'],
        },
        console: { type: 'stdout', layout: consoleLayout },
        file: { type: 'file', layout: notColoredLayout, filename: 'stryker.log' },
        filterLog4jsCategoryConsole: { type: 'categoryFilter', appender: 'console', exclude: 'log4js' },
        filterLog4jsCategoryFile: { type: 'categoryFilter', appender: 'file', exclude: 'log4js' },
        filterLevelConsole: { type: 'logLevelFilter', appender: 'filterLog4jsCategoryConsole', level: consoleLevel },
        filterLevelFile: { type: 'logLevelFilter', appender: 'filterLog4jsCategoryFile', level: fileLevel },
      },
      categories: {
        default: { level: defaultLevel, appenders: ['all'] },
      },
    };
  }
});
