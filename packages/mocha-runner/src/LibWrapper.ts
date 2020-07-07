import * as Mocha from 'mocha';
import * as multimatch from 'multimatch';

import { MochaOptions } from '../src-generated/mocha-runner-options';

let loadOptions: undefined | ((argv?: string[] | string) => { [key: string]: any } | undefined);
let collectFiles: undefined | ((options: MochaOptions) => string[]);
let handleRequires: undefined | ((requires?: string[]) => Promise<any>);
let loadRootHooks: undefined | ((rootHooks: any) => Promise<any>);

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
  const runHelpers = require('mocha/lib/cli/run-helpers');
  collectFiles = runHelpers.handleFiles;
  handleRequires = runHelpers.handleRequires; // handleRequires is available since mocha v7.2
  loadRootHooks = runHelpers.loadRootHooks; // loadRootHooks is available since mocha v7.2

  if (!collectFiles) {
    // Might be moved: https://github.com/mochajs/mocha/commit/15b96afccaf508312445770e3af1c145d90b28c6#diff-39b692a81eb0c9f3614247af744ab4a8
    collectFiles = require('mocha/lib/cli/collect-files');
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
  public static collectFiles = collectFiles;
  public static handleRequires = handleRequires;
  public static loadRootHooks = loadRootHooks;
}
