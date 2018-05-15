import * as log4js from 'log4js';
import { LoggerFactory } from 'stryker-api/logging';

let notConfigured = true;

export default class LogConfigurator {

  static setImplementation(): void {
    LoggerFactory.setLogImplementation(log4js.getLogger);
  }

  static forMaster(logLevel = 'info') {
    const layout: log4js.PatternLayout = {
      type: 'pattern',
      pattern: '%[%r (%z) %p %c%] %m'
    };
    this.setImplementation();
    if (notConfigured) {
      log4js.configure({
        appenders: {
          console: { type: 'stdout', layout },
          file: { type: 'file', filename: 'application.log', layout },
          filteredConsole: { type: 'logLevelFilter', appender: 'console', level: logLevel },
          server: { type: 'multiprocess', mode: 'master', appender: 'file' }
        },
        categories: {
          default: { appenders: ['filteredConsole', 'file'], level: 'trace' }
        },
      });
      notConfigured = false;
    }
  }

  static forWorker() {
    this.setImplementation();
    log4js.configure({
      appenders: {
        server: { type: 'multiprocess', mode: 'worker' }
      },
      categories: {
        default: { appenders: ['server'], level: 'trace' }
      },
    });
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
    };
  }
}