import { Config, ConfigWriter } from 'stryker-api/config';
import * as log4js from 'log4js';

export default class MochaConfigWriter implements ConfigWriter {
  private log: log4js.Logger;

  constructor() {
    this.log = log4js.getLogger('MochaConfigWriter');
  }

  write(config: Config) {
    if (config.coverageAnalysis === 'perTest' && config.testRunner !== 'mocha') {
      this.log.warn(`Framework "mocha" with coverageAnalysis "perTest" is only supported with the "mocha" test runner (not "${config.testRunner}"). Downgrading to coverageAnalysis "all".`);
      config.coverageAnalysis = 'all';
    }
  }
}