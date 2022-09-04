import log4js, { LoggingEvent } from 'log4js';

export function createLoggingEvent(overrides?: Partial<LoggingEvent>): LoggingEvent {
  return {
    categoryName: 'category',
    context: null,
    data: ['foo data'],
    level: log4js.levels.DEBUG,
    pid: 42,
    serialise() {
      return JSON.stringify(this);
    },
    startTime: new Date(42),
    ...overrides,
  } as LoggingEvent;
}
