import * as _ from 'lodash';
import * as fs from 'mz/fs';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import StrykerError from '../utils/StrykerError';

export const CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
  '    config.set({\n' +
  '      // your config\n' +
  '    });\n' +
  '  };';

const DEFAULT_CONFIG_FILE = 'stryker.conf.js';

export default class ConfigReader {

  private readonly log = getLogger(ConfigReader.name);

  constructor(private readonly cliOptions: StrykerOptions) { }

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

    if (config.reporter.length) {
      if (Array.isArray(config.reporter)) {
        config.reporters = config.reporter;
      } else {
        config.reporters = [config.reporter];
      }
      this.log.warn(`DEPRECATED: please change the config setting 'reporter: ${JSON.stringify(config.reporter)}' into 'reporters: ${JSON.stringify(config.reporters)}'`);
    }

    if (config.timeoutMs) {
      config.timeoutMS = config.timeoutMs;
      this.log.warn(`DEPRECATED: please change the config setting 'timeoutMs: ${config.timeoutMs}' into 'timeoutMS: ${config.timeoutMS}'`);
    }

    return config;
  }

  private loadConfigModule(): Function {
    // Dummy module to be returned if no config file is loaded.
    let configModule: Function = () => {};

    if (!this.cliOptions.configFile) {
      try {
        fs.accessSync(path.resolve(`./${DEFAULT_CONFIG_FILE}`));
        this.log.info(`Using ${DEFAULT_CONFIG_FILE} in the current working directory.`);
        this.cliOptions.configFile = DEFAULT_CONFIG_FILE;
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
          this.log.info('Please execute `stryker init` in your project\'s root directory.');
          throw new StrykerError('Invalid config file', e);
        }
      }
      if (!_.isFunction(configModule)) {
        this.log.fatal('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
        throw new StrykerError('Config file must export a function!');
      }
    }

    return configModule;
  }
}
