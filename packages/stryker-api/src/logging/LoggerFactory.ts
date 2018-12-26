import Logger from './Logger';
import LoggerFactoryMethod from './LoggerFactoryMethod';

const noopLogger: Logger = {
  isTraceEnabled(): boolean { return false; },
  isDebugEnabled(): boolean { return false; },
  isInfoEnabled(): boolean { return false; },
  isWarnEnabled(): boolean { return false; },
  isErrorEnabled(): boolean { return false; },
  isFatalEnabled(): boolean { return false; },
  trace(): void { },
  debug(): void { },
  info(): void { },
  warn(): void { },
  error(): void { },
  fatal(): void { }
};

let logImplementation: LoggerFactoryMethod = () => noopLogger;

export default class LoggerFactory {

  public static getLogger: LoggerFactoryMethod = (categoryName?: string) => {
    return logImplementation(categoryName);
  }

  public static setLogImplementation(implementation: LoggerFactoryMethod) {
    logImplementation = implementation;
  }
}
