import Logger from './Logger';

/**
 * Represents a factory to get loggers by category name.
 * This interface is used to describe the shape of a logger factory method.
 *
 * @param categoryName name of category to log to.
 * @returns instance of logger for the category
 */
type LoggerFactoryMethod = (categoryName?: string) => Logger;
export default LoggerFactoryMethod;
