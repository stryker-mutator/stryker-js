import { LoggingEvent } from 'log4js';

import { RuntimeAppender } from './runtime-appender.cjs';

/**
 * Pattern that can find ANSI escape codes
 * @see https://github.com/chalk/ansi-regex/blob/02fa893d619d3da85411acc8fd4e2eea0e95a9d9/index.js#L1
 */
const pattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
].join('|');
const ansiRegex = new RegExp(pattern, 'g');

/**
 * A appender that can strip ANSI escape codes, so coloring codes don't end up in the log file.
 */
export class StripAnsiAppender {
  constructor(private readonly appender: RuntimeAppender) {}

  public append(loggingEvent: LoggingEvent): void {
    let ansiStripped = false;
    const strippedData = loggingEvent.data.map((dataElement: unknown) => {
      if (typeof dataElement === 'string') {
        return dataElement.replace(ansiRegex, () => {
          ansiStripped = true;
          return '';
        });
      }
      return dataElement;
    });
    if (ansiStripped) {
      const newEvent = {
        ...loggingEvent,
        data: strippedData,
      };
      this.appender(newEvent);
    } else {
      this.appender(loggingEvent);
    }
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
export function configure(config: { appender: string }, _: unknown, findAppender: (name: string) => RuntimeAppender): RuntimeAppender {
  const stripAnsi = new StripAnsiAppender(findAppender(config.appender));
  return stripAnsi.append.bind(stripAnsi);
}
