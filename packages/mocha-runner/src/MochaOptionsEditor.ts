import { tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, OptionsEditor } from '@stryker-mutator/api/core';

import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaRunnerWithStrykerOptions } from './MochaRunnerWithStrykerOptions';

export default class MochaOptionsEditor implements OptionsEditor {
  public static inject = tokens('loader');
  constructor(private readonly loader: MochaOptionsLoader) {}

  public edit(options: StrykerOptions): void {
    const optionsWithMocha = options as MochaRunnerWithStrykerOptions;
    optionsWithMocha.mochaOptions = this.loader.load(optionsWithMocha);
  }
}
