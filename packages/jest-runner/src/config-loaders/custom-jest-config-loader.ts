import fs from 'fs';
import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';

import { loader, projectRoot } from '../plugin-tokens';
import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options';

import { JestConfigLoader } from './jest-config-loader';
import { NodeRequireFunction } from './node-require-function';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export class CustomJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(commonTokens.logger, commonTokens.options, loader, projectRoot);

  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly require: NodeRequireFunction,
    private readonly root: string
  ) {}

  public loadConfig(): Config.InitialOptions {
    const jestConfig = this.readConfigFromJestConfigFile() || this.readConfigFromPackageJson() || {};
    return jestConfig;
  }

  private readConfigFromJestConfigFile() {
    try {
      const jestOptions = this.options as JestRunnerOptionsWithStrykerOptions;
      const configFilePath = path.join(this.root, jestOptions.jest?.configFile ?? 'jest.config.js');
      const config = this.require(configFilePath);
      this.log.debug(`Read Jest config from ${configFilePath}`);
      return config;
    } catch {
      /* Don't return anything (implicitly return undefined) */
    }
  }

  private readConfigFromPackageJson() {
    try {
      const configFilePath = path.join(this.root, 'package.json');
      const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8')).jest;
      this.log.debug(`Read Jest config from ${configFilePath}`);
      return config;
    } catch {
      /* Don't return anything (implicitly return undefined) */
    }
  }
}
