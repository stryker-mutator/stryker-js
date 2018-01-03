import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import * as fs from 'mz/fs';
import * as log4js from 'log4js';
import * as path from 'path';
import * as _ from 'lodash';

export const CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
  '    config.set({\n' +
  '      // your config\n' +
  '    });\n' +
  '  };';

const DEFAULT_CONFIG_FILE = 'stryker.conf.js';

export default class ConfigReader {

  private readonly log = log4js.getLogger(ConfigReader.name);

  constructor(private cliOptions: StrykerOptions) { }

  readConfig() {
    const configModule = this.loadConfigModule();
    const config = new Config();
    try {
      configModule(config);
    } catch (e) {
      this.log.fatal('Error in config file!\n', e);
      process.exit(1);
    }

    // merge the config from config file and cliOptions (precedence)
    config.set(this.cliOptions);
    return config;
  }

  private loadConfigModule(): Function {
    // Dummy module to be returned if no config file is loaded.
    let configModule: Function = function () { };

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
      try {
        configModule = require(`${process.cwd()}/${this.cliOptions.configFile}`);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.cliOptions.configFile) !== -1) {
          this.log.fatal(`File ${process.cwd()}/${this.cliOptions.configFile} does not exist!`);
          this.log.fatal(e);
        } else {
          this.log.fatal('Invalid config file!\n  ' + e.stack);
        }
        this.log.info('Stryker can help you setup a `stryker.conf` file for your project.');
        this.log.info('Please execute `stryker init` in your project\'s root directory.');
        process.exit(1);
      }
      if (!_.isFunction(configModule)) {
        this.log.fatal('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
        process.exit(1);
      }
    }

    return configModule;
  }

}