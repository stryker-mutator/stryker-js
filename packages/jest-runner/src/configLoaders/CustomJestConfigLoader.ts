import fs = require('fs');
import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';

import { loaderToken, projectRootToken } from '../pluginTokens';
import { JestOptions } from '../../src-generated/jest-runner-options';

import JestConfigLoader from './JestConfigLoader';
import { NodeRequireFunction } from './NodeRequireFunction';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export default class CustomJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(commonTokens.logger, commonTokens.options, loaderToken, projectRootToken);

  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly require: NodeRequireFunction,
    private readonly projectRoot: string
  ) {}

  public loadConfig(): Jest.Configuration {
    const jestConfig = this.readConfigFromJestConfigFile() || this.readConfigFromPackageJson() || {};
    return jestConfig;
  }

  private readConfigFromJestConfigFile() {
    try {
      const jestOptions = this.options.jest as JestOptions;
      const configFilePath = path.join(this.projectRoot, jestOptions.configFile || 'jest.conf.js');
      const config = this.require(configFilePath);
      this.log.debug(`Read Jest config from ${configFilePath}`);
      return config;
    } catch {
      /* Don't return anything (implicitly return undefined) */
    }
  }

  private readConfigFromPackageJson() {
    try {
      const configFilePath = path.join(this.projectRoot, 'package.json');
      const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8')).jest;
      this.log.debug(`Read Jest config from ${configFilePath}`);
      return config;
    } catch {
      /* Don't return anything (implicitly return undefined) */
    }
  }
}
