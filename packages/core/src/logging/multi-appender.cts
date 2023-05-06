import type { LoggingEvent } from 'log4js';

import { RuntimeAppender } from './runtime-appender.cjs';

export class MultiAppender {
  constructor(private readonly appenders: RuntimeAppender[]) {}

  public append(loggingEvent: LoggingEvent): void {
    this.appenders.forEach((appender) => appender(loggingEvent));
  }
}

/**
 * This method is expected by log4js to have this _exact_ name
 * and signature.
 * @see https://log4js-node.github.io/log4js-node/writing-appenders.html
 * @param config The appender configuration delivered by log4js
 * @param _ The layouts provided by log4js
 * @param findAppender A method to locate other appenders
 */
export function configure(config: { appenders: string[] }, _: unknown, findAppender: (name: string) => RuntimeAppender): RuntimeAppender {
  const multiAppender = new MultiAppender(config.appenders.map(findAppender));
  return multiAppender.append.bind(multiAppender);
}
