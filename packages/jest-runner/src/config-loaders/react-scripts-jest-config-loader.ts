import path from 'path';

import { tokens } from '@stryker-mutator/api/plugin';
import { Config } from '@jest/types';

import { PropertyPathBuilder, requireResolve } from '@stryker-mutator/util';

import * as pluginTokens from '../plugin-tokens';
import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options';

import { JestConfigLoader } from './jest-config-loader';

export class ReactScriptsJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(pluginTokens.resolve);

  constructor(private readonly resolve: RequireResolve) {}

  public loadConfig(): Config.InitialOptions {
    try {
      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig();

      return jestConfiguration;
    } catch (e) {
      if (this.isNodeErrnoException(e) && e.code === 'MODULE_NOT_FOUND') {
        throw Error(
          `Unable to locate package "react-scripts". This package is required when "${PropertyPathBuilder.create<JestRunnerOptionsWithStrykerOptions>()
            .prop('jest')
            .prop('projectType')
            .build()}" is set to "create-react-app".`
        );
      }
      throw e;
    }
  }

  private isNodeErrnoException(arg: unknown): arg is NodeJS.ErrnoException {
    return arg instanceof Error && 'code' in arg;
  }

  private createJestConfig(): Config.InitialOptions {
    const createReactJestConfig = requireResolve('react-scripts/scripts/utils/createJestConfig') as (
      resolve: (thing: string) => string,
      rootDir: string,
      isEjecting: boolean
    ) => Config.InitialOptions;
    const reactScriptsLocation = path.join(this.resolve('react-scripts/package.json'), '..');
    return createReactJestConfig((relativePath) => path.join(reactScriptsLocation, relativePath), process.cwd(), false);
  }
}
