import {Config} from './api/config';
import * as log4js from 'log4js';
import * as path from 'path';
import * as _ from 'lodash';

export var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
  '    config.set({\n' +
  '      // your config\n' +
  '    });\n' +
  '  };\n'

const log = log4js.getLogger('ConfigReader');

export default class ConfigReader {

  constructor(private cliOptions: any, private configFilePath: string) { }

  readConfig() {
    let configModule = this.loadConfigModule();
    var config = new Config();
    try {
      configModule(config);
    } catch (e) {
      log.fatal('Error in config file!\n', e)
      process.exit(1);
    }

    // merge the config from config file and cliOptions (precedence)
    config.set(this.cliOptions);
    return config;
  }

  private loadConfigModule(): Function {
    let configModule: Function;
    if (this.configFilePath) {
      log.debug('Loading config %s', this.configFilePath);
      try {
        configModule = require(this.configFilePath);
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(this.configFilePath) !== -1) {
          log.fatal('File %s does not exist!', this.configFilePath);
        } else {
          log.fatal('Invalid config file!\n  ' + e.stack);
        }
        process.exit(1);
      }
      if (!_.isFunction(configModule)) {
        log.fatal('Config file must export a function!\n' + CONFIG_SYNTAX_HELP)
        process.exit(1)
      }
    } else {
      log.debug('No config file specified.')
      // if no config file path is passed, we define a dummy config module.
      configModule = function () { }
    }
    return configModule;
  }
}