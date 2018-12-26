import * as Mocha from 'mocha';
import * as multimatch from 'multimatch';

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  public static Mocha = Mocha;
  public static multimatch = multimatch;
  public static require = require;
}
