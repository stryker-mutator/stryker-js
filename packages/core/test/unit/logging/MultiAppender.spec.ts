import { expect } from 'chai';
import * as log4js from 'log4js';

import { configure, RuntimeAppender } from '../../../src/logging/MultiAppender';

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
    const loggingEvent: log4js.LoggingEvent = {
      categoryName: 'category',
      context: null,
      data: ['foo data'],
      level: log4js.levels.DEBUG,
      pid: 42,
      startTime: new Date(42),
    };
    sut(loggingEvent);
    expect(fooLogEvents).lengthOf(1);
    expect(barLogEvents).lengthOf(1);
    expect(fooLogEvents).contains(loggingEvent);
    expect(barLogEvents).contains(loggingEvent);
  });
});
