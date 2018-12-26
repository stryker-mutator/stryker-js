import { Config, ConfigEditor } from 'stryker-api/config';
import MochaOptionsLoader from './MochaOptionsLoader';
import { mochaOptionsKey } from './MochaRunnerOptions';

export default class MochaConfigEditor implements ConfigEditor {
  public edit(config: Config): void {
    config[mochaOptionsKey] = new MochaOptionsLoader().load(config);
  }
}
