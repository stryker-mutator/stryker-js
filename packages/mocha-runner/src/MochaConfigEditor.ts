import { ConfigEditor, Config } from '@stryker-mutator/api/config';
import { mochaOptionsKey } from './utils';
import MochaOptionsLoader from './MochaOptionsLoader';
import { tokens } from '@stryker-mutator/api/plugin';

export default class MochaConfigEditor implements ConfigEditor {

  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(config: Config): void {
    config[mochaOptionsKey] = this.loader.load(config);
  }
}
