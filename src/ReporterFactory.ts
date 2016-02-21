'use strict';

import BaseReporter from './reporters/BaseReporter';
import ConsoleReporter from './reporters/ConsoleReporter';
import TypeUtils from './utils/TypeUtils';

/**
 * Represents a provider for all reporters.
 * @constructor
 */
export default class ReporterFactory {

  private _typeUtils = new TypeUtils();


  /**
   * Gets a reporter for the provided name.
   * @function
   * @param name - The name of the requested reporter.
   * @returns The created reporter.
   */
  getReporter(name: string): BaseReporter {
    this._typeUtils.expectParameterString(name, 'ReporterFactory', 'name');

    switch (name) {
      case 'console':
        return new ConsoleReporter();
      default:
        throw new Error(`Reporter ${name} is not supported. Please check if it is spelled correctly.`);
    }
  };
}