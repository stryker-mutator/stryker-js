import Logger from './Logger';

/**
 * Get a logger instance. Instance is cached on categoryName level.
 *
 * @param   {String} [categoryName] name of category to log to.
 * @returns {Logger} instance of logger for the category
 * @static
 */
export default interface LoggerFactoryMethod {
    (categoryName?: string): Logger;
}