import path from 'path';

import { tokens } from '@stryker-mutator/api/plugin';
import { Config } from '@jest/types';

import { createReactJestConfig } from '../utils';
import * as pluginTokens from '../plugin-tokens';

import { JestConfigLoader } from './jest-config-loader';

export class ReactScriptsJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(pluginTokens.resolve, pluginTokens.projectRoot);

  constructor(private readonly resolve: RequireResolve, private readonly projectRoot: string) {}

  public loadConfig(): Config.InitialOptions {
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

  private createJestConfig(reactScriptsLocation: string): Config.InitialOptions {
    return createReactJestConfig((relativePath: string): string => path.join(reactScriptsLocation, relativePath), this.projectRoot, false);
  }
}
