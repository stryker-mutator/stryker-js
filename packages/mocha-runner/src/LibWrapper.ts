import Mocha from 'mocha';
import multimatch from 'multimatch';

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
  if (!handleFiles) {
    // Might be moved: https://github.com/mochajs/mocha/commit/15b96afccaf508312445770e3af1c145d90b28c6#diff-39b692a81eb0c9f3614247af744ab4a8
    handleFiles = require('mocha/lib/cli/collect-files');
  }
} catch {
  // Mocha < 6 doesn't support `handleFiles`
}

/**
 * Wraps Mocha class and require for testability
 */
export default class LibWrapper {
  public static Mocha = Mocha;
  public static require = require;
  public static multimatch = multimatch;
  public static loadOptions = loadOptions;
  public static handleFiles = handleFiles;
}
