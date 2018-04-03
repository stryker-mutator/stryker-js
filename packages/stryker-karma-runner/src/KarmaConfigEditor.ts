import * as log4js from 'log4js';
import * as karma from 'karma';
import { ConfigEditor, Config as StrykerConfig } from 'stryker-api/config';
import KarmaConfigReader from './KarmaConfigReader';
import { KARMA_CONFIG, KARMA_CONFIG_FILE } from './configKeys';

export default class KarmaConfigEditor implements ConfigEditor {
  
  edit(strykerConfig: StrykerConfig) {
    log4js.setGlobalLogLevel(strykerConfig.logLevel);
    const karmaConfig = new KarmaConfigReader(strykerConfig[KARMA_CONFIG_FILE]).read();
    if (karmaConfig) {
      this.importKarmaConfig(strykerConfig, karmaConfig);
    }
  }

  private importKarmaConfig(strykerConfig: StrykerConfig, karmaConfig: karma.ConfigOptions) {
    strykerConfig[KARMA_CONFIG] = Object.assign(karmaConfig, strykerConfig[KARMA_CONFIG]);
  }

}