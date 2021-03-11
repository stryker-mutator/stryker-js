import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { Config } from '@jest/types';

import { createReactTsJestConfig } from '../utils';
import * as pluginTokens from '../plugin-tokens';

import { JestConfigLoader } from './jest-config-loader';

export class ReactScriptsTSJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(commonTokens.logger, pluginTokens.resolve, pluginTokens.projectRoot);

  constructor(private readonly log: Logger, private readonly resolve: RequireResolve, private readonly projectRoot: string) {}

  public loadConfig(): Config.InitialOptions {
    try {
      // Get the location of react-ts script, this is later used to generate the Jest configuration used for React projects.
      const reactScriptsTsLocation = path.join(this.resolve('react-scripts-ts/package.json'), '..');

      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig(reactScriptsTsLocation);
      jestConfiguration.testEnvironment = 'jsdom';
      this.log.warn(
        'DEPRECATED: The support for create-react-app-ts projects is deprecated and will be removed in the future. Please migrate your project to create-react-app and update your Stryker config setting to "create-react-app" (see https://create-react-app.dev/docs/adding-typescript/)'
      );
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

  private createJestConfig(reactScriptsTsLocation: string): Config.InitialOptions {
    return createReactTsJestConfig((relativePath: string): string => path.join(reactScriptsTsLocation, relativePath), this.projectRoot, false);
  }
}
