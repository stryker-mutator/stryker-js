import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';
import jestConfig from 'jest-config';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';

import { JestConfigLoader } from './jest-config-loader.js';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export class CustomJestConfigLoader implements JestConfigLoader {
  private readonly options: JestRunnerOptionsWithStrykerOptions;
  public static inject = tokens(commonTokens.logger, commonTokens.options);

  constructor(private readonly log: Logger, options: StrykerOptions) {
    this.options = options as JestRunnerOptionsWithStrykerOptions;
  }

  public async loadConfig(): Promise<Config.InitialOptions> {
    const { config, configPath } = await jestConfig.readInitialOptions(this.options.jest.configFile, { skipMultipleConfigError: true });
    if (configPath) {
      this.log.debug(`Read config from "${path.relative(process.cwd(), configPath)}".`);
    } else {
      this.log.debug('No config file read.');
    }
    return config;
  }
}
