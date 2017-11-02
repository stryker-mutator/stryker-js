const pkg = require('jest-cli/package.json');
const Runtime = require('jest-runtime');

const Console = require('console').Console;

import * as log4js from 'log4js';
import * as semver from 'semver';
const log = log4js.getLogger('JestAdapter');

const console = new Console(process.stdout, process.stderr);

/**
 * Interface to decouple the runner from various versions of Jest.
 * Since the runner hooks into some implementation modules of Jest,
 * we cannot expect the API's to be stable at this time.
 */
abstract class JestAdapter {
  abstract buildHasteContext(options: any): Promise<any>;
  abstract runTest(path: string, options: any, resolver: any): Promise<any>;
}

class JestPre20Adapter extends JestAdapter {
  private _runTest = require('jest-cli/build/runTest');

  public buildHasteContext(options: any): Promise<any> {
    const { maxWorkers } = options;
    return Runtime.createHasteContext(options, { console, maxWorkers });
  }

  public runTest(path: string, options: any, resolver: any): Promise<any> {
    return this._runTest(path, options, resolver);
  }
}

class Jest20Adapter extends JestAdapter {
  private _runTest = require('jest-cli/build/runTest');

  public buildHasteContext(options: any): Promise<any> {
    const { maxWorkers } = options;
    return Runtime.createContext(options, { console,  maxWorkers });
  }
  
  public runTest(path: string, options: any, resolver: any): Promise<any> {
    const globalConfig = {};
    return this._runTest(path, globalConfig, options, resolver);
  }
}

class Jest21UpAdapter extends JestAdapter {
  private _runTest = require('jest-runner/build/run_test').default;
  
  public buildHasteContext(options: any): Promise<any> {
    const { maxWorkers } = options;
    return Runtime.createContext(options, { console,  maxWorkers });
  }
  
  public runTest(path: string, options: any, resolver: any): Promise<any> {
    const globalConfig = {};
    return this._runTest(path, globalConfig, options, resolver);
  }
}

const findJestAdapter: () => JestAdapter = () => {
  const jestVersion = pkg.version;
  log.debug(`Found Jest CLI v${jestVersion}`);

  if (!jestVersion) {
    throw new Error(`Did not find package.json for jest-cli. Is it installed?`); 
  }

  if (semver.satisfies(jestVersion, '<20.0.0')) {
    log.info('Detected Jest before v20.0.0');
    return new JestPre20Adapter();
  } else if (semver.satisfies(jestVersion, '>=20.0.0 <21.0.0')) {
    log.info('Detected Jest v20');
    return new Jest20Adapter();
  } else {
    log.info('Detected Jest v21');
    return new Jest21UpAdapter();
  }
};

export {
  JestAdapter,
  findJestAdapter,
}