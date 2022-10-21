import fs from 'fs';
import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';
import type { requireResolve } from '@stryker-mutator/util';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import { pluginTokens } from '../plugin-di.js';

import { jestWrapper } from '../utils/jest-wrapper.js';

import { JestConfigLoader } from './jest-config-loader.js';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export class CustomJestConfigLoader implements JestConfigLoader {
  private readonly options: JestRunnerOptionsWithStrykerOptions;
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.requireFromCwd);

  constructor(private readonly log: Logger, options: StrykerOptions, private readonly requireFromCwd: typeof requireResolve) {
    this.options = options as JestRunnerOptionsWithStrykerOptions;
  }

  public async loadConfig(): Promise<Config.InitialOptions> {
    const { config, configPath } = await jestWrapper.readInitialOptions(this.options.jest.configFile, { skipMultipleConfigError: true });
    if (configPath) {
      this.log.debug(`Read config from "${path.relative(process.cwd(), configPath)}"`);
    } else {
      this.log.debug('No config file read.');
    }
    return config;
  }
}
