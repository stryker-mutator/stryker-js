import * as path from 'path';

import { Config } from '@stryker-mutator/api/config';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';

import { coreTokens } from '../di';

export const CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' + '    config.set({\n' + '      // your config\n' + '    });\n' + '  };';

const DEFAULT_CONFIG_FILE = 'stryker.conf';

export default class ConfigReader {
  public static inject = tokens(coreTokens.cliOptions, commonTokens.logger);
  constructor(private readonly cliOptions: Partial<StrykerOptions>, private readonly log: Logger) {}

  public readConfig() {
    const configModule = this.loadConfigModule();
    const config = new Config();
    try {
      configModule(config);
    } catch (e) {
      throw new StrykerError('Error in config file!', e);
    }

    // merge the config from config file and cliOptions (precedence)
    config.set(this.cliOptions);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Loaded config: ${JSON.stringify(config, null, 2)}`);
    }

    return config;
  }

  private loadConfigModule(): Function {
    // Dummy module to be returned if no config file is loaded.
    let configModule: Function = () => {};

    if (!this.cliOptions.configFile) {
      try {
        const configFile = require.resolve(path.resolve(`./${DEFAULT_CONFIG_FILE}`));
        this.log.info(`Using ${configFile}`);
        this.cliOptions.configFile = configFile;
      } catch (e) {
        this.log.info('No config file specified. Running with command line arguments.');
        this.log.info('Use `stryker init` command to generate your config file.');
      }
    }

    if (this.cliOptions.configFile) {
      this.log.debug(`Loading config ${this.cliOptions.configFile}`);
      const configFileName = path.resolve(this.cliOptions.configFile);
      try {
        configModule = require(configFileName);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.cliOptions.configFile) !== -1) {
          throw new StrykerError(`File ${configFileName} does not exist!`, e);
        } else {
          this.log.info('Stryker can help you setup a `stryker.conf` file for your project.');
          this.log.info("Please execute `stryker init` in your project's root directory.");
          throw new StrykerError('Invalid config file', e);
        }
      }
      if (typeof configModule !== 'function' && typeof configModule !== 'object') {
        this.log.fatal('Config file must be an object or export a function!\n' + CONFIG_SYNTAX_HELP);
        throw new StrykerError('Config file must export a function or be a JSON!');
      }
      if (typeof configModule === 'object') {
        return (config: any) => {
          config.set(configModule);
        };
      }
    }

    return configModule;
  }
}
