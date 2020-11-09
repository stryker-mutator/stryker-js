import * as path from 'path';

import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { deepMerge } from '@stryker-mutator/util/src/deep-merge';
import { cosmiconfigSync } from 'cosmiconfig';

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

const MODULE_NAME = 'stryker';

export default class ConfigReader {
  public static inject = tokens(coreTokens.cliOptions, commonTokens.logger, coreTokens.optionsValidator);
  constructor(private readonly cliOptions: PartialStrykerOptions, private readonly log: Logger, private readonly validator: OptionsValidator) {}

  public readConfig(): StrykerOptions {
    const configModule = this.loadConfigModule();
    let options;
    if (typeof configModule === 'function') {
      this.log.warn(
        'Usage of `module.export = function(config) {}` is deprecated. Please use `module.export = {}` or a "stryker.conf.json" file. For more details, see https://stryker-mutator.io/blog/2020-03-11/stryker-version-3#new-config-format'
      );
      options = defaultOptions();
      (configModule as Function)(createConfig(options));
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

  private loadConfigModule(): PartialStrykerOptions {
    const configExplorer = cosmiconfigSync(`${MODULE_NAME}`, {
      searchPlaces: ['package.json', `${MODULE_NAME}.conf.js`, `${MODULE_NAME}.conf.json`],
    });
    let result: ReturnType<typeof configExplorer.search> = null;

    if (!this.cliOptions.configFile) {     
      this.log.debug('Searching for config file');
      try {
        result = configExplorer.search();
      } catch (e) {
        this.handleSyntaxError(e);
      }

      if (result) {
        this.log.info(`Using ${result.filepath}`);
        this.cliOptions.configFile = result.filepath;
      } else {
        this.log.info('No config file specified. Running with command line arguments only.');
        this.log.info('Use `stryker init` command to generate your config file.');
      }
    } else {
      this.log.debug(`Loading config ${this.cliOptions.configFile}`);
      const resolvedFilename = this.resolveConfigFile(String(this.cliOptions.configFile));
      try {
        result = configExplorer.load(resolvedFilename);
      } catch (e) {
        this.handleSyntaxError(e);
      }
    }

    if (result && result.config) {
      if (typeof result.config !== 'function' && typeof result.config !== 'object') {
        this.log.fatal('Config file must export an object!\n' + CONFIG_SYNTAX_HELP);
        throw new ConfigError('Config file must export an object!');
      }
      return result.config;
    }
    return {};
  }

  private resolveConfigFile(configFileName: string) {
    const configFile = path.resolve(configFileName);
    try {
      return require.resolve(configFile);
    } catch {
      throw new ConfigError(`File ${configFile} does not exist!`);
    }
  }

  private handleSyntaxError(e: Error) {
    this.log.info('Stryker can help you setup a `stryker.conf` file for your project.');
    this.log.info("Please execute `stryker init` in your project's root directory.");
    throw new ConfigError(`Invalid config file. Inner error: SyntaxError: ${e.message}`);
  }
}
