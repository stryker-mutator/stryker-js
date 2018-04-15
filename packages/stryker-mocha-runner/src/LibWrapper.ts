import * as Mocha from 'mocha';
import * as multimatch from 'multimatch';

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  static Mocha = Mocha;
  static require = require;
  static multimatch = multimatch;
}