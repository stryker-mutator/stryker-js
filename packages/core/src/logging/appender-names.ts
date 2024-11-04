import * as log4js from 'log4js';
export const appenderNames = Object.freeze({
  file: 'file',
  filterLevelFile: 'filterLevelFile',
  filterLog4jsCategoryFile: 'filterLog4jsCategoryFile',
  console: 'console',
  filterLevelConsole: 'filterLevelConsole',
  stripAnsi: 'stripAnsi',
  filterLog4jsCategoryConsole: 'filterLog4jsCategoryConsole',
  all: 'all',
  server: 'server',
});

export type AppenderName = (typeof appenderNames)[keyof typeof appenderNames];
export type AppendersConfiguration = Partial<Record<AppenderName, log4js.Appender>>;
