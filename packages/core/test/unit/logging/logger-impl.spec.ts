import sinon from 'sinon';
import { LoggingSink } from '../../../src/logging/index.js';
import { LoggerImpl } from '../../../src/logging/logger-impl.js';
import { expect } from 'chai';
import { LogLevel } from '@stryker-mutator/api/core';

describe.only(LoggerImpl.name, () => {
  let loggingBackendMock: sinon.SinonStubbedInstance<LoggingSink>;
  let sut: LoggerImpl;

  beforeEach(() => {
    loggingBackendMock = {
      isEnabled: sinon.stub(),
      log: sinon.stub(),
    };
    sut = new LoggerImpl('category', loggingBackendMock);
  });

  ([LogLevel.Debug, LogLevel.Error, LogLevel.Fatal, LogLevel.Information, LogLevel.Trace, LogLevel.Warning] as const).forEach((level) => {
    function capitalize<T extends string>(s: T): Capitalize<T> {
      return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>;
    }
    it(`should ask the logging backend when checking if ${level} is enabled`, () => {
      sut[`is${capitalize(level)}Enabled`]();
      expect(loggingBackendMock.isEnabled).calledWith(level);
    });

    it(`should log to the logging backend when logging ${level}`, () => {
      const expectedError = new Error('error message');
      sut[level]('message', 'arg1', 'arg2', expectedError);
      expect(loggingBackendMock.log).calledWithMatch({ level, categoryName: 'category', data: ['message', 'arg1', 'arg2', expectedError] });
    });
  });
});
