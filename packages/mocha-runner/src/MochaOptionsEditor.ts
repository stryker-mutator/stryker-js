import { tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, OptionsEditor } from '@stryker-mutator/api/core';

import MochaOptionsLoader from './MochaOptionsLoader';
import { mochaOptionsKey } from './utils';

export default class MochaOptionsEditor implements OptionsEditor {
  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(options: StrykerOptions): void {
    options[mochaOptionsKey] = this.loader.load(options);
  }
}
