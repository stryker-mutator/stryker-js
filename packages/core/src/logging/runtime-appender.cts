import { LoggingEvent } from 'log4js';

export type RuntimeAppender = (loggingEvent: LoggingEvent) => void;
