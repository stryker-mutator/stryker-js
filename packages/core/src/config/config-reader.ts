import * as path from 'path';

import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { deepMerge } from '@stryker-mutator/util/src/deep-merge';
import { cosmiconfigSync } from 'cosmiconfig';

import { coreTokens } from '../di';
import { ConfigError } from '../errors';

import { OptionsValidator } from './options-validator';

const MODULE_NAME = 'stryker';

export default class ConfigReader {
  public static inject = tokens(coreTokens.cliOptions, commonTokens.logger, coreTokens.optionsValidator);
  constructor(private readonly cliOptions: PartialStrykerOptions, private readonly log: Logger, private readonly validator: OptionsValidator) {}

  public readConfig(): StrykerOptions {
    const configModule = this.loadConfigModule();
    this.validator.validate(configModule);
    let options = configModule;
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
    let result: ReturnType<typeof configExplorer.search>;

    try {
      if (!this.cliOptions.configFile) {
        this.log.debug('Searching for config file');
        result = configExplorer.search();
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
        result = configExplorer.load(resolvedFilename);
      }
    } catch (e) {
      throw new ConfigError(e.message);
    }

    if (result && result.config) {
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
}
