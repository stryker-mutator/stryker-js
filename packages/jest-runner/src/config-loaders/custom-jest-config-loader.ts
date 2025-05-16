import path from 'path';
import fs from 'fs';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import type { Config } from '@jest/types';
import type { I, requireResolve } from '@stryker-mutator/util';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import { JestConfigWrapper } from '../utils/jest-config-wrapper.js';
import { pluginTokens } from '../plugin-di.js';

import { JestConfigLoader } from './jest-config-loader.js';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export class CustomJestConfigLoader implements JestConfigLoader {
  private readonly options: JestRunnerOptionsWithStrykerOptions;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.requireFromCwd,
    pluginTokens.jestConfigWrapper,
  );

  constructor(
    private readonly log: Logger,
    options: StrykerOptions,
    private readonly requireFromCwd: typeof requireResolve,
    private readonly jestConfig: I<JestConfigWrapper>,
  ) {
    this.options = options as JestRunnerOptionsWithStrykerOptions;
  }

  public async loadConfig(): Promise<Config.InitialOptions> {
    try {
      return await this.readConfigNative();
    } catch {
      return this.readConfigManually();
    }
  }

  /**
   * Tries to read the jest config via the native jest api, available since jest@>=29.3
   */
  private async readConfigNative(): Promise<Config.InitialOptions> {
    const { config, configPath } = await this.jestConfig.readInitialOptions(
      this.options.jest.configFile,
      { skipMultipleConfigError: true },
    );
    const hint = '(used native `readInitialOptions` from jest-config)';
    if (configPath) {
      this.log.debug(
        `Read config from "${path.relative(process.cwd(), configPath)}" ${hint}.`,
      );
    } else {
      this.log.debug(`No config file read ${hint}.`);
    }
    return config;
  }

  /**
   * The legacy readConfig functionality
   */
  public async readConfigManually(): Promise<Config.InitialOptions> {
    const jestConfig =
      (await this.readConfigFromJestConfigFile()) ??
      (await this.readConfigFromPackageJson()) ??
      {};
    this.log.debug(
      "Read config: %s (used stryker's own config reading functionality)",
      jestConfig,
    );
    return jestConfig;
  }

  private async readConfigFromJestConfigFile(): Promise<
    Config.InitialOptions | undefined
  > {
    const configFilePath = this.resolveJestConfigFilePath();
    if (configFilePath) {
      let config = this.requireFromCwd(configFilePath) as
        | Config.InitialOptions
        | (() => Promise<Config.InitialOptions>);
      if (typeof config === 'function') {
        config = await config();
      }
      this.log.debug(`Read Jest config from ${configFilePath}`);
      this.setRootDir(config, configFilePath);
      return config;
    }
    return undefined;
  }

  private async readConfigFromPackageJson(): Promise<
    Config.InitialOptions | undefined
  > {
    const pkgJsonFilePath = this.resolvePackageJsonFilePath();
    if (pkgJsonFilePath) {
      const config: Config.InitialOptions =
        JSON.parse(await fs.promises.readFile(pkgJsonFilePath, 'utf8')).jest ??
        {};
      this.log.debug(`Read Jest config from ${pkgJsonFilePath}`);
      this.setRootDir(config, pkgJsonFilePath);
      return config;
    }
    return undefined;
  }

  private resolvePackageJsonFilePath(): string | undefined {
    const jestOptions = this.options;
    const packageJsonCandidate = path.resolve(
      jestOptions.jest.configFile ?? 'package.json',
    );
    if (
      packageJsonCandidate.endsWith('package.json') &&
      (jestOptions.jest.configFile ?? fs.existsSync(packageJsonCandidate))
    ) {
      return packageJsonCandidate;
    }
    return undefined;
  }
  private setRootDir(config: Config.InitialOptions, configFilePath: string) {
    config.rootDir = path.resolve(
      path.dirname(configFilePath),
      config.rootDir ?? '.',
    );
  }

  private resolveJestConfigFilePath(): string | undefined {
    const jestOptions = this.options;
    const configFileCandidate = path.resolve(
      jestOptions.jest.configFile ?? 'jest.config.js',
    );
    if (
      !configFileCandidate.endsWith('package.json') &&
      (jestOptions.jest.configFile ?? fs.existsSync(configFileCandidate))
    ) {
      return configFileCandidate;
    }
    return undefined;
  }
}
