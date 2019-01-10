import { ConfigEditor, Config } from 'stryker-api/config';
import { mochaOptionsKey } from './MochaRunnerOptions';
import MochaOptionsLoader from './MochaOptionsLoader';
import { tokens } from '@stryker-mutator/util';

export default class MochaConfigEditor implements ConfigEditor {

  public static inject = tokens('loader');
  constructor(private loader: MochaOptionsLoader) {}

  public edit(config: Config): void {
    config[mochaOptionsKey] = this.loader.load(config);
  }
}
