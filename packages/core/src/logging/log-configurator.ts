import { fileURLToPath, URL } from 'url';

import { LogLevel } from '@stryker-mutator/api/core';
import log4js from 'log4js';

import { netUtils } from '../utils/net-utils.js';

import { LoggingClientContext } from './logging-client-context.js';
import { minLevel } from './log-utils.js';

const enum AppenderName {
  File = 'file',
  FilterLevelFile = 'filterLevelFile',
  FilterLog4jsCategoryFile = 'filterLog4jsCategoryFile',
  Console = 'console',
  FilterLevelConsole = 'filterLevelConsole',
  StripAnsi = 'stripAnsi',
  FilterLog4jsCategoryConsole = 'filterLog4jsCategoryConsole',
  All = 'all',
  Server = 'server',
}

const layouts: { color: log4js.PatternLayout; noColor: log4js.PatternLayout } = {
  color: {
    pattern: '%[%r (%z) %p %c%] %m',
    type: 'pattern',
  },
  noColor: {
    pattern: '%r (%z) %p %c %m',
    type: 'pattern',
  },
};

type AppendersConfiguration = Partial<Record<AppenderName, log4js.Appender>>;

const LOG_FILE_NAME = 'stryker.log';
export class LogConfigurator {
  private static createMainProcessAppenders(consoleLogLevel: LogLevel, fileLogLevel: LogLevel, allowConsoleColors: boolean): AppendersConfiguration {
    // Add the custom "multiAppender": https://log4js-node.github.io/log4js-node/appenders.html#other-appenders
    const multiAppender = {
      type: fileURLToPath(new URL('./multi-appender.cjs', import.meta.url)),
      appenders: [AppenderName.FilterLevelConsole],
    };

    const consoleLayout = allowConsoleColors ? layouts.color : layouts.noColor;

    let allAppenders: AppendersConfiguration = {
      [AppenderName.Console]: { type: 'stdout', layout: consoleLayout },
      // Exclude messages like: "ERROR log4js A worker log process hung up unexpectedly" #1245
      [AppenderName.FilterLog4jsCategoryConsole]: { type: 'categoryFilter', appender: AppenderName.Console, exclude: 'log4js' },
      [AppenderName.FilterLevelConsole]: { type: 'logLevelFilter', appender: AppenderName.FilterLog4jsCategoryConsole, level: consoleLogLevel },
      [AppenderName.All]: multiAppender,
    };

    // only add file if it is needed. Otherwise log4js will create the file directly, pretty annoying.
    if (fileLogLevel.toUpperCase() !== LogLevel.Off.toUpperCase()) {
      // Add the custom "multiAppender": https://log4js-node.github.io/log4js-node/appenders.html#other-appenders
      const stripAnsiAppender = {
        type: fileURLToPath(new URL('./strip-ansi-appender.cjs', import.meta.url)),
        appender: AppenderName.File,
      };
      const fileAppender: log4js.FileAppender = { type: 'file', filename: LOG_FILE_NAME, layout: layouts.noColor };
      const filterLog4sCategory: log4js.CategoryFilterAppender = { type: 'categoryFilter', appender: AppenderName.StripAnsi, exclude: 'log4js' };
      const filterFileAppender: log4js.LogLevelFilterAppender = {
        type: 'logLevelFilter',
        appender: AppenderName.FilterLog4jsCategoryFile,
        level: fileLogLevel,
      };

      // Don't simply add the appenders, instead actually make sure they are ordinal "before" the others.
      // See https://github.com/log4js-node/log4js-node/issues/746
      allAppenders = {
        ...allAppenders,
        [AppenderName.File]: fileAppender,
        [AppenderName.StripAnsi]: stripAnsiAppender,
        [AppenderName.FilterLog4jsCategoryFile]: filterLog4sCategory,
        [AppenderName.FilterLevelFile]: filterFileAppender,
      };

      multiAppender.appenders.push(AppenderName.FilterLevelFile);
    }

    return allAppenders;
  }

  private static createLog4jsConfig(defaultLogLevel: LogLevel, appenders: AppendersConfiguration): log4js.Configuration {
    return {
      appenders,
      categories: {
        default: {
          appenders: [AppenderName.All],
          level: defaultLogLevel,
        },
      },
    };
  }

  /**
   * Configure logging for the master process. Either call this method or `configureChildProcess` before any `getLogger` calls.
   * @param consoleLogLevel The log level to configure for the console
   * @param fileLogLevel The log level to configure for the "stryker.log" file
   */
  public static configureMainProcess(
    consoleLogLevel: LogLevel = LogLevel.Information,
    fileLogLevel: LogLevel = LogLevel.Off,
    allowConsoleColors = true,
  ): void {
    const appenders = this.createMainProcessAppenders(consoleLogLevel, fileLogLevel, allowConsoleColors);
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
  public static async configureLoggingServer(
    consoleLogLevel: LogLevel,
    fileLogLevel: LogLevel,
    allowConsoleColors: boolean,
  ): Promise<LoggingClientContext> {
    const loggerPort = await netUtils.getFreePort();

    // Include the appenders for the main Stryker process, as log4js has only one single `configure` method.
    const appenders = this.createMainProcessAppenders(consoleLogLevel, fileLogLevel, allowConsoleColors);
    const multiProcessAppender: log4js.MultiprocessAppender = {
      appender: AppenderName.All,
      loggerPort,
      mode: 'master',
      type: 'multiprocess',
    };
    appenders[AppenderName.Server] = multiProcessAppender;
    const defaultLogLevel = minLevel(consoleLogLevel, fileLogLevel);
    log4js.configure(this.createLog4jsConfig(defaultLogLevel, appenders));

    const context: LoggingClientContext = {
      level: defaultLogLevel,
      port: loggerPort,
    };
    return context;
  }

  /**
   * Configures the logging for a worker process. Sends all logging to the master process.
   * Either call this method or `configureMainProcess` before any `getLogger` calls.
   * @param context the logging client context used to configure the logging client
   */
  public static configureChildProcess(context: LoggingClientContext): void {
    const clientAppender: log4js.MultiprocessAppender = { type: 'multiprocess', mode: 'worker', loggerPort: context.port };
    const appenders: AppendersConfiguration = { [AppenderName.All]: clientAppender };
    log4js.configure(this.createLog4jsConfig(context.level, appenders));
  }

  public static shutdown(): Promise<void> {
    return new Promise((res, rej) => {
      log4js.shutdown((err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }
}
