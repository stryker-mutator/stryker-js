import path from 'path';

import { createRequire } from 'module';

import Mocha, { type RootHookObject } from 'mocha';

import { MochaOptions } from '../src-generated/mocha-runner-options.js';

const require = createRequire(import.meta.url);
const mochaRoot = path.dirname(require.resolve('mocha/package.json'));
// https://github.com/mochajs/mocha/blob/master/lib/cli/run-helpers.js#L132

const runHelpers = require(`${mochaRoot}/lib/cli/run-helpers`);

let collectFiles: ((options: MochaOptions) => string[] | { files: string[]; unmatchedFiles: string[] }) | undefined;

/*
 * If read, object containing parsed arguments
 * @since 6.0.0'
 * @see https://mochajs.org/api/module-lib_cli_options.html#.loadOptions
 */

const loadOptions: (argv?: string[] | string) => Record<string, any> | undefined = require(`${mochaRoot}/lib/cli/options`).loadOptions;

const handleRequires: (requires?: string[]) => Promise<RootHookObject> = runHelpers.handleRequires;
const loadRootHooks: ((rootHooks: any) => Promise<any>) | undefined = runHelpers.loadRootHooks; // loadRootHooks is available since mocha v7.2 and removed again in 8.0

collectFiles = runHelpers.handleFiles;
if (!collectFiles) {
  // Might be moved: https://github.com/mochajs/mocha/commit/15b96afccaf508312445770e3af1c145d90b28c6#diff-39b692a81eb0c9f3614247af744ab4a8

  collectFiles = require(`${mochaRoot}/lib/cli/collect-files`);
}

/**
 * Wraps Mocha class and require for testability
 */
export class LibWrapper {
  public static Mocha = Mocha;
  public static require = require;
  public static loadOptions = loadOptions;
  public static collectFiles = collectFiles;
  public static handleRequires = handleRequires;
  public static loadRootHooks = loadRootHooks;
}
