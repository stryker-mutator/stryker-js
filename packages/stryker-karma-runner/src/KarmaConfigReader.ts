import * as log4js from 'log4js';
import * as path from 'path';
import * as karma from 'karma';
import { requireModule } from './utils';

const karmaConfigReaderLocation = 'karma/lib/config';

export default class KarmaConfigReader {

  private readonly log: log4js.Logger;

  constructor(private karmaConfigFile: string) {
    if (this.karmaConfigFile) {
      this.karmaConfigFile = path.resolve(this.karmaConfigFile);
    }
    this.log = log4js.getLogger('KarmaConfigReader');
  }

  read(): karma.ConfigOptions | null {
    if (this.karmaConfigFile && typeof this.karmaConfigFile === 'string') {
      this.log.info('Importing config from "%s"', this.karmaConfigFile);
      try {
        this.validateConfig();
        return this.readConfig();
      } catch (error) {
        this.log.error(`Could not read karma configuration from ${this.karmaConfigFile}.`, error);
      }
    }
    return null;
  }

  private validateConfig() {
    // Delegate validation of configuration to karma config lib, as it has nice and recognizable error handling
    this.parseNativeKarmaConfig();
  }

  private readConfig(): karma.ConfigOptions {
    // We cannot delegate config reading to karma's config reader, because we cannot serialize the result to child processes
    // It results in: TypeError: Serializing native function: bound configure
    const configModule = requireModule(this.karmaConfigFile);
    const config: karma.ConfigOptions = new Config();
    configModule(config);

    // Use native functionality of parsing the files, so we ensure that those are correctly resolved
    const karmaOptions = this.parseNativeKarmaConfig();
    if (karmaOptions && karmaOptions.files) {
      config['files'] = karmaOptions.files;
      config['exclude'] = karmaOptions.exclude;
    }
    return config;
  }

  private parseNativeKarmaConfig(): karma.ConfigOptions | null {
    let cfg: any;
    try {
      cfg = require(karmaConfigReaderLocation);
    } catch (e) {
      this.log.warn(`Could not find karma config reader at "%s"`, karmaConfigReaderLocation);
    }
    if (cfg) {
      return cfg.parseConfig(this.karmaConfigFile, {});
    } else {
      return null;
    }
  }
}

class Config implements karma.ConfigOptions {
  [key: string]: any
  
  autoWatch: boolean = false;
  
  readonly LOG_DISABLE = 'OFF';
  readonly LOG_ERROR = 'ERROR';
  readonly LOG_WARN = 'WARN';
  readonly LOG_INFO = 'INFO';
  readonly LOG_DEBUG = 'DEBUG';

  set(obj: any) {
    for (let i in obj) {
      this[i] = obj[i];
    }
  }
}