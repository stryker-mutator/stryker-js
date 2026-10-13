import path from 'path';
import fs from 'fs';

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
      mocha: mochaModule.default ?? bundledMocha,
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

/*
 * Mocha's cli internals are not part of its public api, so their file extension changes between major versions:
 * `.js` up to and including Mocha 11, `.cjs` since Mocha 12 turned the package into an ES module.
 */
async function loadMochaCliModule(name: string): Promise<any> {
  for (const extension of ['.js', '.cjs', '.mjs']) {
    const modulePath = path.join(
      mochaRoot,
      'lib',
      'cli',
      `${name}${extension}`,
    );

    if (!fs.existsSync(modulePath)) {
      continue;
    }

    if (extension === '.mjs') {
      const module = await import(pathToFileURL(modulePath).href);
      return module.default ?? module;
    }

    return require(modulePath);
  }

  throw new Error(
    `Cannot find Mocha's "lib/cli/${name}" module in "${mochaRoot}". Please check if your Mocha version is supported.`,
  );
}

// https://github.com/mochajs/mocha/blob/master/lib/cli/run-helpers.js#L132
const runHelpers = await loadMochaCliModule('run-helpers');

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

const loadOptions: LoadOptions = (await loadMochaCliModule('options'))
  .loadOptions;

const handleRequires: (requires?: string[]) => Promise<RootHookObject> =
  runHelpers.handleRequires;

const loadRootHooks: ((rootHooks: any) => Promise<any>) | undefined =
  runHelpers.loadRootHooks; // loadRootHooks is available since mocha v7.2 and removed again in 8.0

collectFiles = runHelpers.handleFiles;

if (!collectFiles) {
  // Might be moved:
  // https://github.com/mochajs/mocha/commit/15b96afccaf508312445770e3af1c145d90b28c6#diff-39b692a81eb0c9f3614247af744ab4a8
  collectFiles = await loadMochaCliModule('collect-files');
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
