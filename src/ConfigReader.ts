import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import * as log4js from 'log4js';
import * as path from 'path';
import * as _ from 'lodash';

const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];

export var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
  '    config.set({\n' +
  '      // your config\n' +
  '    });\n' +
  '  };\n';

const log = log4js.getLogger('ConfigReader');

export default class ConfigReader {

  constructor(private options: StrykerOptions) { }

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
    config.set(this.options);
    this.validate(config);
    return config;
  }

  private loadConfigModule(): Function {
    let configModule: Function;
    if (this.options.configFile) {
      log.debug('Loading config %s', this.options.configFile);
      try {
        configModule = require(`${process.cwd()}/${this.options.configFile}`);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.options.configFile) !== -1) {
          log.fatal('File %s does not exist!', this.options.configFile);
          log.fatal(e);
        } else {
          log.fatal('Invalid config file!\n  ' + e.stack);
        }
        process.exit(1);
      }
      if (!_.isFunction(configModule)) {
        log.fatal('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
        process.exit(1);
      }
    } else {
      log.debug('No config file specified.');
      // if no config file path is passed, we define a dummy config module.
      configModule = function () { };
    }
    return configModule;
  }

  private validate(options: StrykerOptions) {
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