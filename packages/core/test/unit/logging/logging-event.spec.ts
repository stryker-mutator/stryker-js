import { LogLevel } from '@stryker-mutator/api/core';
import {
  LoggingEvent,
  SerializedLoggingEvent,
} from '../../../src/logging/logging-event.js';
import { expect } from 'chai';
import { escapeRegExp } from '@stryker-mutator/util';

describe(LoggingEvent.name, () => {
  describe(LoggingEvent.prototype.format.name, () => {
    it('should return a formatted string', () => {
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message'],
      );
      const expected = new RegExp(
        `^\\d{2}:\\d{2}:\\d{2} \\(${process.pid}\\) INFO category message$`,
      );
      expect(loggingEvent.format()).matches(expected);
    });
    it('should also add the error', () => {
      const expectedError = new Error('error message');
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message', expectedError],
      );
      const actual = loggingEvent.format();
      const expected = new RegExp(
        `^\\d{2}:\\d{2}:\\d{2} \\(${process.pid}\\) INFO category message ${escapeRegExp(expectedError.stack!)}$`,
      );
      expect(actual).matches(expected);
    });

    it('should format the message', () => {
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message %s %d', 'arg', 42],
      );
      const expected = new RegExp(
        `^\\d{2}:\\d{2}:\\d{2} \\(${process.pid}\\) INFO category message arg 42$`,
      );
      expect(loggingEvent.format()).matches(expected);
    });
  });

  describe(LoggingEvent.prototype.formatColorized.name, () => {
    (
      [
        [LogLevel.Information, 32],
        [LogLevel.Trace, 34],
        [LogLevel.Debug, 36],
        [LogLevel.Warning, 33],
        [LogLevel.Error, 91],
        [LogLevel.Fatal, 35],
        [LogLevel.Off, 90],
      ] as const
    ).forEach(([level, color]) => {
      it(`should return a colorized formatted string for the ${level} level`, () => {
        const loggingEvent = LoggingEvent.create('category', level, [
          'message',
        ]);
        //"\u001b[32m23:35:31 (2571) INFO category\u001b[39m message"
        const expected = new RegExp(
          `^\\u001b\\[${color}m\\d{2}:\\d{2}:\\d{2} \\(${process.pid}\\) ${level.toUpperCase()} category\\u001b\\[39m message$`,
        );
        expect(loggingEvent.formatColorized()).matches(expected);
      });
    });
  });

  describe(LoggingEvent.prototype.serialize.name, () => {
    it('should serialize the logging event', () => {
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message'],
      );
      const actual = loggingEvent.serialize();
      expect(actual).deep.eq({
        level: LogLevel.Information,
        categoryName: 'category',
        message: 'message',
        startTime: loggingEvent.startTime.toJSON(),
        pid: process.pid,
      } satisfies SerializedLoggingEvent);
    });

    it('should also serialize the error', () => {
      const expectedError = new Error('error message');
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message', expectedError],
      );
      const actual = loggingEvent.serialize();
      expect(actual).deep.eq({
        level: LogLevel.Information,
        categoryName: 'category',
        message: `message ${expectedError.stack}`,
        startTime: loggingEvent.startTime.toJSON(),
        pid: process.pid,
      } satisfies SerializedLoggingEvent);
    });

    it('should serialize a formatted message', () => {
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message %s %d', 'arg', 42],
      );
      const actual = loggingEvent.serialize();
      expect(actual).deep.eq({
        level: LogLevel.Information,
        categoryName: 'category',
        message: 'message arg 42',
        startTime: loggingEvent.startTime.toJSON(),
        pid: process.pid,
      } satisfies SerializedLoggingEvent);
    });
  });

  describe(LoggingEvent.deserialize.name, () => {
    it('should deserialize the logging event', () => {
      const expectedStartTime = new Date(2010, 1, 1);
      const serialized: SerializedLoggingEvent = {
        level: LogLevel.Information,
        categoryName: 'category',
        message: 'message',
        startTime: expectedStartTime.toJSON(),
        pid: 1337,
      };
      const actual = LoggingEvent.deserialize(serialized);
      expect(actual).deep.eq({
        level: LogLevel.Information,
        categoryName: 'category',
        data: ['message'],
        startTime: new Date(serialized.startTime),
        pid: 1337,
      } satisfies Partial<LoggingEvent>);
    });

    it('should be able to deserialize a serialized event', () => {
      const expectedError = new Error('expected');
      const loggingEvent = LoggingEvent.create(
        'category',
        LogLevel.Information,
        ['message', expectedError],
      );
      const serialized = loggingEvent.serialize();
      const actual = LoggingEvent.deserialize(serialized);
      loggingEvent.data.pop();
      loggingEvent.data.pop();
      loggingEvent.data.push(`message ${expectedError.stack}`);
      expect(actual).deep.eq(loggingEvent);
    });
  });
});
