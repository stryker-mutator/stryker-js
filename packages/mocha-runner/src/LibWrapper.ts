import * as Mocha from 'mocha';
import * as multimatch from 'multimatch';

let loadOptions: undefined | ((argv?: string[] | string) => MochaOptions | undefined);

try {
  /*
  * If read, object containing parsed arguments
  * @since 6.0.0'
  * @see https://mochajs.org/api/module-lib_cli_options.html#.loadOptions
  */
  loadOptions = require('mocha/lib/cli/options').loadOptions;
} catch {
  // Mocha < 6 doesn't support `loadOptions`
}

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  public static Mocha = Mocha;
  public static require = require;
  public static multimatch = multimatch;
  public static loadOptions = loadOptions;
}
