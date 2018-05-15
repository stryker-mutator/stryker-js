import { ConfigEditor, Config } from 'stryker-api/config';
import { mochaOptionsKey } from './MochaRunnerOptions';
import MochaOptionsLoader from './MochaOptionsLoader';

export default class MochaConfigEditor implements ConfigEditor {
  edit(config: Config): void {
    config[mochaOptionsKey] = new MochaOptionsLoader().load(config);
  }
}