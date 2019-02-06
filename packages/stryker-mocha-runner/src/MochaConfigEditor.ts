import { ConfigEditor, Config } from 'stryker-api/config';
import { mochaOptionsKey } from './MochaRunnerOptions';
import MochaOptionsLoader from './MochaOptionsLoader';
import { tokens } from 'stryker-api/plugin';

export default class MochaConfigEditor implements ConfigEditor {

  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(config: Config): void {
    config[mochaOptionsKey] = this.loader.load(config);
  }
}
