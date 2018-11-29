import { ConfigEditor, Config } from 'stryker-api/config';
import MochaOptionsLoader from './MochaOptionsLoader';

export default class MochaConfigEditor implements ConfigEditor {
  public edit(config: Config): void {
    if (config.testRunner.settings) {
      config.testRunner.settings.config = new MochaOptionsLoader().load(config);
    }
  }
}
