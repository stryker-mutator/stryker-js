import path from 'path';

import { createRequire } from 'module';
import { pathToFileURL } from 'url';

import { default as bundledMocha, type RootHookObject } from 'mocha';

import { MochaOptions } from '../src-generated/mocha-runner-options.js';

const resolveMocha = async () => {
  try {
    const require = createRequire(path.join(process.cwd(), 'package.json'));

    const mochaPath = require.resolve('mocha');
    const mochaModule = await import(pathToFileURL(mochaPath).href);

    return {
      mocha: mochaModule.default ?? Mocha,
      require,
      mochaRoot: path.dirname(require.resolve('mocha/package.json')),
    };
  } catch {
    const require = createRequire(import.meta.url);

    return {
      mocha: bundledMocha,
      require,
      mochaRoot: path.dirname(require.resolve('mocha/package.json')),
    };
  }
};

const { mocha, require, mochaRoot } = await resolveMocha();

// https://github.com/mochajs/mocha/blob/master/lib/cli/run-helpers.js#L132
const runHelpers = require(`${mochaRoot}/lib/cli/run-helpers`);

let collectFiles:
  | ((
      options: MochaOptions,
    ) => string[] | { files: string[]; unmatchedFiles: string[] })
  | undefined;

/*
 * If read, object containing parsed arguments
 * @since 6.0.0'
 * @see https://mochajs.org/api/module-lib_cli_options.html#.loadOptions
 */
type LoadOptions = (
  argv?: string[] | string,
) => Record<string, any> | undefined;

async function resolveLoadOptions(): Promise<LoadOptions> {
  try {
    return require(`${mochaRoot}/lib/cli/options`).loadOptions;
  } catch {
    // Since Mocha 12 the cli is distributed as ECMAScript modules
    const options = await import(
      pathToFileURL(path.join(mochaRoot, 'lib/cli/options.mjs')).href
    );

    return options.loadOptions;
  }
}

const loadOptions = await resolveLoadOptions();

const handleRequires: (requires?: string[]) => Promise<RootHookObject> =
  runHelpers.handleRequires;

const loadRootHooks: ((rootHooks: any) => Promise<any>) | undefined =
  runHelpers.loadRootHooks; // loadRootHooks is available since mocha v7.2 and removed again in 8.0

collectFiles = runHelpers.handleFiles;

if (!collectFiles) {
  // Might be moved:
  // https://github.com/mochajs/mocha/commit/15b96afccaf508312445770e3af1c145d90b28c6#diff-39b692a81eb0c9f3614247af744ab4a8
  collectFiles = require(`${mochaRoot}/lib/cli/collect-files`);
}

/**
 * Wraps Mocha class and require for testability
 */
export class LibWrapper {
  public static Mocha = mocha;
  public static require = require;
  public static loadOptions = loadOptions;
  public static collectFiles = collectFiles;
  public static handleRequires = handleRequires;
  public static loadRootHooks = loadRootHooks;
}
