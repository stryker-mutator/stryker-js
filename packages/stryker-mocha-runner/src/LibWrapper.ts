import * as Mocha from 'mocha';

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  static Mocha = Mocha;
  static require = require;
}