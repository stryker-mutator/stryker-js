import { ConfigEditor, Config } from 'stryker-api/config';
import { mochaOptionsKey } from './MochaRunnerOptions';
import MochaOptionsLoader from './MochaOptionsLoader';
import { setGlobalLogLevel } from 'log4js';

export default class MochaConfigEditor implements ConfigEditor {
  edit(config: Config): void {
    setGlobalLogLevel(config.logLevel || 'info');
    config[mochaOptionsKey] = new MochaOptionsLoader().load(config);
  }
}