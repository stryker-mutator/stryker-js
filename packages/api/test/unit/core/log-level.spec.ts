import { expect } from 'chai';

import { LogLevel } from '../../../src/core';

describe('LogLevel', () => {
  function arrangeActAssertLogLevel(actual: LogLevel, expected: string) {
    it(`should provide "${expected}" for log level "${actual}"`, () => {
      expect(actual).eq(expected);
    });
  }

  arrangeActAssertLogLevel(LogLevel.Off, 'off');
  arrangeActAssertLogLevel(LogLevel.Fatal, 'fatal');
  arrangeActAssertLogLevel(LogLevel.Error, 'error');
  arrangeActAssertLogLevel(LogLevel.Warning, 'warn');
  arrangeActAssertLogLevel(LogLevel.Information, 'info');
  arrangeActAssertLogLevel(LogLevel.Debug, 'debug');
  arrangeActAssertLogLevel(LogLevel.Trace, 'trace');
});
