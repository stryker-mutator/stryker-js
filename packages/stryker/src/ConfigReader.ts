import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import * as fs from 'mz/fs';
import * as log4js from 'log4js';
import * as path from 'path';
import * as _ from 'lodash';

const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];

export const CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
  '    config.set({\n' +
  '      // your config\n' +
  '    });\n' +
  '  };';

const DEFAULT_CONFIG_FILE = 'stryker.conf.js';

const log = log4js.getLogger('ConfigReader');

export default class ConfigReader {

  constructor(private cliOptions: StrykerOptions) { }

  readConfig() {
    const configModule = this.loadConfigModule();
    const config = new Config();
    try {
      configModule(config);
    } catch (e) {
      log.fatal('Error in config file!\n', e);
      process.exit(1);
    }

    // merge the config from config file and cliOptions (precedence)
    config.set(this.cliOptions);
    this.validate(config);
    return config;
  }

  private loadConfigModule(): Function {
    // Dummy module to be returned if no config file is loaded.
    let configModule: Function = function () { };

    if (!this.cliOptions.configFile) {
      try {
        fs.accessSync(path.resolve(`./${DEFAULT_CONFIG_FILE}`));
        log.info(`Using ${DEFAULT_CONFIG_FILE} in the current working directory.`);
        this.cliOptions.configFile = DEFAULT_CONFIG_FILE;
      } catch (e) {
        log.info('No config file specified. Running with command line arguments.');
        log.info('Use `stryker init` command to generate your config file.');
      }
    }

    if (this.cliOptions.configFile) {
      log.debug(`Loading config ${this.cliOptions.configFile}`);
      try {
        configModule = require(`${process.cwd()}/${this.cliOptions.configFile}`);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.cliOptions.configFile) !== -1) {
          log.fatal(`File ${process.cwd()}/${this.cliOptions.configFile} does not exist!`);
          log.fatal(e);
        } else {
          log.fatal('Invalid config file!\n  ' + e.stack);
        }
        log.info('Stryker can help you setup a `stryker.conf` file for your project.');
        log.info('Please execute `stryker init` in your project\'s root directory.');
        process.exit(1);
      }
      if (!_.isFunction(configModule)) {
        log.fatal('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
        process.exit(1);
      }
    }

    return configModule;
  }

  private validate(options: Config) {

    if (VALID_COVERAGE_ANALYSIS_VALUES.indexOf(options.coverageAnalysis) < 0) {
      log.fatal(`Value "${options.coverageAnalysis}" is invalid for \`coverageAnalysis\`. Expected one of the folowing: ${VALID_COVERAGE_ANALYSIS_VALUES.map(v => `"${v}"`).join(', ')}`);
      process.exit(1);
    }
    if (options.coverageAnalysis === 'perTest' && !options.testFramework) {
      const validCoverageAnalysisSettingsExceptPerTest = VALID_COVERAGE_ANALYSIS_VALUES.filter(v => v !== 'perTest').map(v => `"${v}"`).join(', ');
      log.fatal(`Configured coverage analysis 'perTest' requires a test framework to be configured. Either configure your test framework (for example testFramework: 'jasmine') or set coverageAnalysis setting to one of the following: ${validCoverageAnalysisSettingsExceptPerTest}`);
      process.exit(1);
    }
  }
}