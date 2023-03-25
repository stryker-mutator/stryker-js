import { Logger } from './logger.js';

/**
 * Represents a factory to get loggers by category name.
 * This interface is used to describe the shape of a logger factory method.
 *
 * @param   {String} [categoryName] name of category to log to.
 * @returns {Logger} instance of logger for the category
 */
export type LoggerFactoryMethod = (categoryName?: string) => Logger;
