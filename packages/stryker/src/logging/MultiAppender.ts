import { LoggingEvent } from 'log4js';

export interface RuntimeAppender {
  (loggingEvent: LoggingEvent): void;
}

export class MultiAppender {

  constructor(private appenders: RuntimeAppender[]) { }

  append(loggingEvent: LoggingEvent) {
    this.appenders.forEach(appender => appender(loggingEvent));
  }
}

export function configure(config: { appenders: string[] }, _: any, findAppender: (name: string) => RuntimeAppender ): RuntimeAppender {
  const multiAppender = new MultiAppender(config.appenders.map(name => findAppender(name)));
  return multiAppender.append.bind(multiAppender);
}

