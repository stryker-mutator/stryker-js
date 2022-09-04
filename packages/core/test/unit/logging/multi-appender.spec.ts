import { expect } from 'chai';
import log4js from 'log4js';

import { configure } from '../../../src/cjs/logging/multi-appender.js';
import { RuntimeAppender } from '../../../src/cjs/logging/runtime-appender.js';

import { createLoggingEvent } from './helpers.js';

describe('MultiAppender', () => {
  let sut: RuntimeAppender;
  let fooLogEvents: log4js.LoggingEvent[];
  let barLogEvents: log4js.LoggingEvent[];

  beforeEach(() => {
    fooLogEvents = [];
    barLogEvents = [];
    sut = configure({ appenders: ['foo', 'bar'] }, null, (name) => {
      switch (name) {
        case 'foo':
          return (event) => fooLogEvents.push(event);
        case 'bar':
          return (event) => barLogEvents.push(event);
        default:
          throw new Error(`${name} is not supported`);
      }
    });
  });

  it('should fan out events to all appenders', () => {
    const loggingEvent: log4js.LoggingEvent = createLoggingEvent();
    sut(loggingEvent);
    expect(fooLogEvents).deep.eq([loggingEvent]);
    expect(barLogEvents).deep.eq([loggingEvent]);
  });
});
