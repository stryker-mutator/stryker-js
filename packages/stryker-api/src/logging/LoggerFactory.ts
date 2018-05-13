import LoggerFactoryMethod from './LoggerFactoryMethod';
import Logger from './Logger';

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

let implementation: LoggerFactoryMethod = () => noopLogger;

export default class LoggerFactory {

  static setLogImplementation(implementation: LoggerFactoryMethod) {
    this.getLogger = implementation;
  }

  static getLogger: LoggerFactoryMethod = (categoryName?: string) => {
    return implementation(categoryName);
  }
}