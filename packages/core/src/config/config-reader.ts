import path from 'path';

import { PartialStrykerOptions, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { deepMerge } from '@stryker-mutator/util';

import { coreTokens } from '../di';
import { ConfigError } from '../errors';

import { defaultOptions, OptionsValidator } from './options-validator';
import { createConfig } from './create-config';

export const CONFIG_SYNTAX_HELP = `
/**
  * @type {import('@stryker-mutator/api/core').StrykerOptions}
  */
module.exports = {
  // You're options here!
}`.trim();

const DEFAULT_CONFIG_FILE = 'stryker.conf';

export class ConfigReader {
  public static inject = tokens(coreTokens.cliOptions, commonTokens.logger, coreTokens.optionsValidator);
  constructor(private readonly cliOptions: PartialStrykerOptions, private readonly log: Logger, private readonly validator: OptionsValidator) {}

  public readConfig(): StrykerOptions {
    const configModule = this.loadConfigModule();
    let options: StrykerOptions;
    if (typeof configModule === 'function') {
      this.log.warn(
        'Usage of `module.export = function(config) {}` is deprecated. Please use `module.export = {}` or a "stryker.conf.json" file. For more details, see https://stryker-mutator.io/blog/2020-03-11/stryker-version-3#new-config-format'
      );
      options = defaultOptions();
      configModule(createConfig(options));
    } else {
      this.validator.validate(configModule);
      options = configModule;
    }
    // merge the config from config file and cliOptions (precedence)
    deepMerge(options, this.cliOptions);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Loaded config: ${JSON.stringify(options, null, 2)}`);
    }
    return options;
  }

  private loadConfigModule(): PartialStrykerOptions | ((options: StrykerOptions) => void) {
    let configModule: PartialStrykerOptions | ((config: StrykerOptions) => void) = {};

    if (!this.cliOptions.configFile) {
      try {
        const configFile = require.resolve(path.resolve(`./${DEFAULT_CONFIG_FILE}`));
        this.log.info(`Using ${path.basename(configFile)}`);
        this.cliOptions.configFile = configFile;
      } catch (e) {
        this.log.info('No config file specified. Running with command line arguments.');
        this.log.info('Use `stryker init` command to generate your config file.');
      }
    }

    if (typeof this.cliOptions.configFile === 'string') {
      this.log.debug(`Loading config ${this.cliOptions.configFile}`);
      const configFile = this.resolveConfigFile(this.cliOptions.configFile);
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        configModule = require(configFile);
      } catch (e) {
        this.log.info('Stryker can help you setup a `stryker.conf` file for your project.');
        this.log.info("Please execute `stryker init` in your project's root directory.");
        throw new ConfigError('Invalid config file', e);
      }
      if (typeof configModule !== 'function' && typeof configModule !== 'object') {
        this.log.fatal('Config file must export an object!\n' + CONFIG_SYNTAX_HELP);
        throw new ConfigError('Config file must export an object!');
      }
    }

    return configModule;
  }

  private resolveConfigFile(configFileName: string) {
    const configFile = path.resolve(configFileName);
    try {
      return require.resolve(configFile);
    } catch {
      throw new ConfigError(`File ${configFile} does not exist!`);
    }
  }
}
