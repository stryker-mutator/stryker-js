import { ConfigEditor, Config } from '@stryker-mutator/api/config';
import { MOCHA_OPTIONS_KEY } from './utils';
import MochaOptionsLoader from './MochaOptionsLoader';
import { tokens } from '@stryker-mutator/api/plugin';

export default class MochaConfigEditor implements ConfigEditor {

  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(config: Config): void {
    config[MOCHA_OPTIONS_KEY] = this.loader.load(config);
  }
}
