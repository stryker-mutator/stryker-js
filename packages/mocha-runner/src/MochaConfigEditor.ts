import { Config, ConfigEditor } from '@stryker-mutator/api/config';
import { tokens } from '@stryker-mutator/api/plugin';

import MochaOptionsLoader from './MochaOptionsLoader';
import { mochaOptionsKey } from './utils';

export default class MochaConfigEditor implements ConfigEditor {
  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(config: Config): void {
    config[mochaOptionsKey] = this.loader.load(config);
  }
}
