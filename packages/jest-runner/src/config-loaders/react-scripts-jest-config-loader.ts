import path from 'path';

import { Config } from '@jest/types';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { propertyPath, type requireResolve } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';

import * as pluginTokens from '../plugin-tokens.js';
import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';

import { JestConfigLoader } from './jest-config-loader.js';

export class ReactScriptsJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(commonTokens.logger, pluginTokens.resolve, pluginTokens.processEnv, pluginTokens.requireFromCwd);

  constructor(
    private readonly log: Logger,
    private readonly resolve: RequireResolve,
    private readonly processEnvRef: NodeJS.ProcessEnv,
    private readonly requireFromCwd: typeof requireResolve
  ) {}

  public loadConfig(): Config.InitialOptions {
    try {
      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig();

      this.setEnv();

      return jestConfiguration;
    } catch (e) {
      if (this.isNodeErrnoException(e) && e.code === 'MODULE_NOT_FOUND') {
        throw Error(
          `Unable to locate package "react-scripts". This package is required when "${propertyPath<JestRunnerOptionsWithStrykerOptions>()(
            'jest',
            'projectType'
          )}" is set to "create-react-app".`
        );
      }
      throw e;
    }
  }

  private isNodeErrnoException(arg: any): arg is NodeJS.ErrnoException {
    return arg.code !== undefined;
  }

  private createJestConfig(): Config.InitialOptions {
    const createReactJestConfig = this.requireFromCwd('react-scripts/scripts/utils/createJestConfig') as (
      resolve: (thing: string) => string,
      rootDir: string,
      isEjecting: boolean
    ) => Config.InitialOptions;
    const reactScriptsLocation = path.join(this.resolve('react-scripts/package.json'), '..');
    return createReactJestConfig((relativePath) => path.join(reactScriptsLocation, relativePath), process.cwd(), false);
  }
  private setEnv() {
    // Jest CLI will set process.env.NODE_ENV to 'test' when it's null, do the same here
    // https://github.com/facebook/jest/blob/master/packages/jest-cli/bin/jest.js#L12-L14
    if (!this.processEnvRef.NODE_ENV) {
      this.processEnvRef.NODE_ENV = 'test';
    }
    try {
      this.requireFromCwd('react-scripts/config/env.js');
    } catch (err) {
      this.log.warn(
        'Unable to load environment variables using "react-scripts/config/env.js". The environment variables might differ from expected. Please open an issue if you think this is a bug: https://github.com/stryker-mutator/stryker-js/issues/new/choose.'
      );
      this.log.debug('Inner error', err);
    }
  }
}
