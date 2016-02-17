'use strict';

import ConsoleReporter from './reporters/ConsoleReporter';
var TypeUtils = require('./utils/TypeUtils');

/**
 * Represents a provider for all reporters.
 * @constructor
 */
function ReporterFactory() {
  this._typeUtils = new TypeUtils();
}

/**
 * Gets a reporter for the provided name.
 * @function
 * @param {String} name - The name of the requested reporter.
 * @returns {Object} The created reporter.
 */
ReporterFactory.prototype.getReporter = function(name) {
  this._typeUtils.expectParameterString(name, 'ReporterFactory', 'name');

  switch (name) {
    case 'console':
      return new ConsoleReporter();
    default:
      throw new Error('Reporter ' + name + ' is not supported. Please check if it is spelled correctly.');
  }
};

module.exports = ReporterFactory;
