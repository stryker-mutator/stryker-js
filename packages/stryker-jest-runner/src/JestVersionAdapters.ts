const runTest = require('jest-cli/build/runTest');
const Runtime = require('jest-runtime');

const Console = require('console').Console;

import * as log4js from 'log4js';
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
  public buildHasteContext(options: any): Promise<any> {
    const { maxWorkers } = options;
    return Runtime.createHasteContext(options, { console, maxWorkers });
  }

  public runTest(path: string, options: any, resolver: any): Promise<any> {
    return runTest(path, options, resolver);
  }
}

class JestPost20Adapter extends JestAdapter {
  public buildHasteContext(options: any): Promise<any> {
    const { maxWorkers } = options;
    return Runtime.createContext(options, { console,  maxWorkers });
  }
  
  public runTest(path: string, options: any, resolver: any): Promise<any> {
    const globalConfig = {};
    return runTest(path, globalConfig, options, resolver);
  }
}

const findJestAdapter = () => {
  const pre20 = typeof Runtime.createHasteContext !== 'undefined';
  log.info(`Detected Jest ${pre20 ? 'pre' : 'post'} v20.0.0`);
  const adapter = pre20 ? new JestPre20Adapter() : new JestPost20Adapter();
  return (adapter as JestAdapter);
};

export {
  JestAdapter,
  JestPre20Adapter,
  JestPost20Adapter,
  findJestAdapter,
}