import fs from 'fs';
import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';
import type { requireResolve } from '@stryker-mutator/util';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import * as pluginTokens from '../plugin-tokens.js';

import { JestConfigLoader } from './jest-config-loader.js';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export class CustomJestConfigLoader implements JestConfigLoader {
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.requireFromCwd);

  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly requireFromCwd: typeof requireResolve) {}

  public loadConfig(): Config.InitialOptions {
    const jestConfig = this.readConfigFromJestConfigFile() ?? this.readConfigFromPackageJson() ?? {};
    this.log.debug('Final jest config: %s', jestConfig);
    return jestConfig;
  }

  private readConfigFromJestConfigFile(): Config.InitialOptions | undefined {
    const configFilePath = this.resolveJestConfigFilePath();
    if (configFilePath) {
      const config = this.requireFromCwd(configFilePath) as Config.InitialOptions;
      this.log.debug(`Read Jest config from ${configFilePath}`);
      this.setRootDir(config, configFilePath);
      return config;
    }
    return undefined;
  }

  private readConfigFromPackageJson(): Config.InitialOptions | undefined {
    const pkgJsonFilePath = this.resolvePackageJsonFilePath();
    if (pkgJsonFilePath) {
      const config: Config.InitialOptions = JSON.parse(fs.readFileSync(pkgJsonFilePath, 'utf8')).jest ?? {};
      this.log.debug(`Read Jest config from ${pkgJsonFilePath}`);
      this.setRootDir(config, pkgJsonFilePath);
      return config;
    }
    return undefined;
  }

  private resolvePackageJsonFilePath(): string | undefined {
    const jestOptions = this.options as JestRunnerOptionsWithStrykerOptions;
    const packageJsonCandidate = path.resolve(jestOptions.jest.configFile ?? 'package.json');
    if (packageJsonCandidate.endsWith('package.json') && (jestOptions.jest.configFile || fs.existsSync(packageJsonCandidate))) {
      return packageJsonCandidate;
    }
    return undefined;
  }
  private setRootDir(config: Config.InitialOptions, configFilePath: string) {
    config.rootDir = path.resolve(path.dirname(configFilePath), config.rootDir ?? '.');
  }

  private resolveJestConfigFilePath(): string | undefined {
    const jestOptions = this.options as JestRunnerOptionsWithStrykerOptions;
    const configFileCandidate = path.resolve(jestOptions.jest.configFile ?? 'jest.config.js');
    if (!configFileCandidate.endsWith('package.json') && (jestOptions.jest.configFile || fs.existsSync(configFileCandidate))) {
      return configFileCandidate;
    }
    return undefined;
  }
}
