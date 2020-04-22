import path from 'path';

import { createReactJestConfig } from '../utils/createReactJestConfig';

import JestConfigLoader from './JestConfigLoader';

export default class ReactScriptsJestConfigLoader implements JestConfigLoader {
  private readonly projectRoot: string;

  constructor(projectRoot: string, private readonly resolve: RequireResolve = require.resolve) {
    this.projectRoot = projectRoot;
  }

  public loadConfig(): Jest.Configuration {
    try {
      // Get the location of react script, this is later used to generate the Jest configuration used for React projects.
      const reactScriptsLocation = path.join(this.resolve('react-scripts/package.json'), '..');

      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig(reactScriptsLocation);

      return jestConfiguration;
    } catch (e) {
      if (this.isNodeErrnoException(e) && e.code === 'MODULE_NOT_FOUND') {
        throw Error('Unable to locate package react-scripts. This package is required when projectType is set to "create-react-app".');
      }
      throw e;
    }
  }

  private isNodeErrnoException(arg: any): arg is NodeJS.ErrnoException {
    return arg.code !== undefined;
  }

  private createJestConfig(reactScriptsLocation: string): Jest.Configuration {
    return createReactJestConfig((relativePath: string): string => path.join(reactScriptsLocation, relativePath), this.projectRoot, false);
  }
}
