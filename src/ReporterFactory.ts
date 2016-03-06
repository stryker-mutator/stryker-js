'use strict';

import BaseReporter from './reporters/BaseReporter';
import ConsoleReporter from './reporters/ConsoleReporter';

/**
 * Represents a provider for all reporters.
 * @constructor
 */
export default class ReporterFactory {
  
  /**
   * Gets a reporter for the provided name.
   * @function
   * @param name - The name of the requested reporter.
   * @returns The created reporter.
   */
  getReporter(name: string): BaseReporter {
    switch (name) {
      case 'console':
        return new ConsoleReporter();
      default:
        throw new Error(`Reporter ${name} is not supported. Please check if it is spelled correctly.`);
    }
  };
}