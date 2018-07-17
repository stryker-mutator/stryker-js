import * as log4js from 'log4js';
import { LoggerFactory } from 'stryker-api/logging';
import { LogLevel } from 'stryker-api/core';
import { minLevel } from './logUtils';
import LoggingClientContext from './LoggingClientContext';
import { getFreePort } from '../utils/netUtils';

enum AppenderName {
  File = 'file',
  FilteredFile = 'filteredFile',
  Console = 'console',
  FilteredConsole = 'filteredConsole',
  All = 'all',
  Server = 'server'
}

const layouts: { color: log4js.PatternLayout, noColor: log4js.PatternLayout } = {
  color: {
    type: 'pattern',
    pattern: '%[%r (%z) %p %c%] %m'
  },
  noColor: {
    type: 'pattern',
    pattern: '%r (%z) %p %c %m'
  }
};

interface AppendersConfiguration {
  [name: string]: log4js.Appender;
}

const LOG_FILE_NAME = 'stryker.log';
export default class LogConfigurator {

  private static createMainProcessAppenders(consoleLogLevel: LogLevel, fileLogLevel: LogLevel): AppendersConfiguration {

    // Add the custom "multiAppender": https://log4js-node.github.io/log4js-node/appenders.html#other-appenders
    const multiAppender = { type: require.resolve('./MultiAppender'), appenders: ['filteredConsole'] };

    let allAppenders: AppendersConfiguration = {
      [AppenderName.Console]: { type: 'stdout', layout: layouts.color },
      [AppenderName.FilteredConsole]: { type: 'logLevelFilter', appender: 'console', level: consoleLogLevel },
      [AppenderName.All]: multiAppender,
    };

    // only add file if it is needed. Otherwise log4js will create the file directly, pretty annoying.
    if (fileLogLevel.toUpperCase() !== LogLevel.Off.toUpperCase()) {
      const fileAppender: log4js.FileAppender = { type: 'file', filename: LOG_FILE_NAME, layout: layouts.noColor };
      const filteredFileAppender: log4js.LogLevelFilterAppender = { type: 'logLevelFilter', appender: 'file', level: fileLogLevel };

      // Don't simply add the appenders, instead actually make sure they are ordinal "before" the others.
      // See https://github.com/log4js-node/log4js-node/issues/746
      allAppenders = Object.assign({ [AppenderName.File]: fileAppender, [AppenderName.FilteredFile]: filteredFileAppender }, allAppenders);

      multiAppender.appenders.push(AppenderName.FilteredFile);
    }

    return allAppenders;
  }

  private static createLog4jsConfig(defaultLogLevel: LogLevel, appenders: AppendersConfiguration): log4js.Configuration {
    return {
      appenders,
      categories: {
        default: {
          appenders: [AppenderName.All], level: defaultLogLevel
        }
      }
    };
  }

  private static setImplementation(): void {
    LoggerFactory.setLogImplementation(log4js.getLogger);
  }

  /**
   * Configure logging for the master process. Either call this method or `configureChildProcess` before any `getLogger` calls.
   * @param consoleLogLevel The log level to configure for the console
   * @param fileLogLevel The log level to configure for the "stryker.log" file
   */
  static configureMainProcess(consoleLogLevel: LogLevel = LogLevel.Information, fileLogLevel: LogLevel = LogLevel.Off) {
    this.setImplementation();
    const appenders = this.createMainProcessAppenders(consoleLogLevel, fileLogLevel);
    log4js.configure(this.createLog4jsConfig(minLevel(consoleLogLevel, fileLogLevel), appenders));
  }

  /**
   * Configure the logging for the server. Includes the master configuration.
   * This method should only be called ONCE, as it starts the log4js server to listen for log events.
   * It returns the logging client context that should be used to configure the child processes.
   *
   * @param consoleLogLevel the console log level
   * @param fileLogLevel the file log level
   * @returns the context
   */
  static async configureLoggingServer(consoleLogLevel: LogLevel, fileLogLevel: LogLevel): Promise<LoggingClientContext> {
    this.setImplementation();
    const loggerPort = await getFreePort();

    // Include the appenders for the main Stryker process, as log4js has only one single `configure` method.
    const appenders = this.createMainProcessAppenders(consoleLogLevel, fileLogLevel);
    const multiProcessAppender: log4js.MultiprocessAppender = {
      type: 'multiprocess',
      mode: 'master',
      appender: AppenderName.All,
      loggerPort
    };
    appenders[AppenderName.Server] = multiProcessAppender;
    const defaultLogLevel = minLevel(consoleLogLevel, fileLogLevel);
    log4js.configure(this.createLog4jsConfig(defaultLogLevel, appenders));

    const context: LoggingClientContext = {
      port: loggerPort,
      level: defaultLogLevel
    };
    return context;
  }


  /**
   * Configures the logging for a worker process. Sends all logging to the master process.
   * Either call this method or `configureMainProcess` before any `getLogger` calls.
   * @param context the logging client context used to configure the logging client
   */
  static configureChildProcess(context: LoggingClientContext) {
    this.setImplementation();
    const clientAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'worker', loggerPort: context.port };
    const appenders: AppendersConfiguration = { [AppenderName.All]: clientAppender };
    log4js.configure(this.createLog4jsConfig(context.level, appenders));
  }

  static shutdown(): Promise<void> {
    return new Promise((res, rej) => {
      log4js.shutdown(err => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }
}