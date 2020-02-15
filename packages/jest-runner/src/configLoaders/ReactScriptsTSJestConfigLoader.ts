import * as path from 'path';

import { createReactTsJestConfig } from '../utils/createReactJestConfig';

import JestConfigLoader from './JestConfigLoader';

export default class ReactScriptsTSJestConfigLoader implements JestConfigLoader {
  private readonly projectRoot: string;

  constructor(projectRoot: string, private readonly resolve = require.resolve) {
    this.projectRoot = projectRoot;
  }

  public loadConfig(): Jest.Configuration {
    try {
      // Get the location of react-ts script, this is later used to generate the Jest configuration used for React projects.
      const reactScriptsTsLocation = path.join(this.resolve('react-scripts-ts/package.json'), '..');

      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig(reactScriptsTsLocation);

      // Set test environment to jsdom (otherwise Jest won't run)
      jestConfiguration.testEnvironment = 'jsdom';

      return jestConfiguration;
    } catch (e) {
      if (this.isNodeErrnoException(e) && e.code === 'MODULE_NOT_FOUND') {
        throw Error('Unable to locate package react-scripts-ts. ' + 'This package is required when projectType is set to "create-react-app-ts".');
      }
      throw e;
    }
  }

  private isNodeErrnoException(arg: any): arg is NodeJS.ErrnoException {
    return arg.code !== undefined;
  }

  private createJestConfig(reactScriptsTsLocation: string): Jest.Configuration {
    return createReactTsJestConfig((relativePath: string): string => path.join(reactScriptsTsLocation, relativePath), this.projectRoot, false);
  }
}
