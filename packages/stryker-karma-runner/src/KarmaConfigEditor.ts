import { Config, ConfigEditor } from 'stryker-api/config';
import { getLogger } from 'stryker-api/logging';
import StrykerKarmaSetup, { DEPRECATED_KARMA_CONFIG, DEPRECATED_KARMA_CONFIG_FILE, DEPRECATED_KARMA_CONFIG_KEY } from './StrykerKarmaSetup';

export default class KarmaConfigEditor implements ConfigEditor {

  public log = getLogger(KarmaConfigEditor.name);

  public edit(config: Config): void {

    let settings = config.testRunner.settings as StrykerKarmaSetup || {};

    if (config[DEPRECATED_KARMA_CONFIG_KEY]) {
      this.log.warn(`DEPRECATED: "${DEPRECATED_KARMA_CONFIG_KEY}" is renamed to "testRunner.settings". Please change it in your stryker configuration.`);
      settings = config[DEPRECATED_KARMA_CONFIG_KEY] as StrykerKarmaSetup;
    }

    if (config[DEPRECATED_KARMA_CONFIG]) {
      this.log.warn(`DEPRECATED: "${DEPRECATED_KARMA_CONFIG}" is renamed to "testRunner.settings.config". Please change it in your stryker configuration.`);
      settings.config = config[DEPRECATED_KARMA_CONFIG];
    }

    if (config[DEPRECATED_KARMA_CONFIG_FILE]) {
      this.log.warn(`DEPRECATED: "${DEPRECATED_KARMA_CONFIG_FILE}" is renamed to "testRunner.settings.configFile". Please change it in your stryker configuration.`);
      settings.configFile = config[DEPRECATED_KARMA_CONFIG_FILE];
    }

    config.testRunner.settings = settings;
  }
}
