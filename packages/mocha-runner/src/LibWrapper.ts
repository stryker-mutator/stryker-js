import * as Mocha from 'mocha';
import * as multimatch from 'multimatch';
import { MochaOptions } from './MochaOptions';

let loadOptions: undefined | ((argv?: string[] | string) => { [key: string]: any } | undefined);
let handleFiles: undefined | ((options: MochaOptions) => string[]);

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

try {
  // https://github.com/mochajs/mocha/blob/master/lib/cli/run-helpers.js#L132
  handleFiles = require('mocha/lib/cli/run-helpers').handleFiles;
} catch {
  // Mocha < 6 doesn't support `handleFiles`
}

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  public static mocha = Mocha;
  public static require = require;
  public static multimatch = multimatch;
  public static loadOptions = loadOptions;
  public static handleFiles = handleFiles;
}
