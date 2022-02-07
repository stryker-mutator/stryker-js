import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginContext } from '@stryker-mutator/api/plugin';
import sinon from 'sinon';
import { Injector, createInjector } from 'typed-inject';

import * as factory from './factory.js';

class TestInjector {
  public options!: StrykerOptions;
  public logger!: sinon.SinonStubbedInstance<Logger>;
  public injector!: Injector<PluginContext>;

  public reset() {
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.injector = createInjector()
      .provideValue(commonTokens.getLogger, () => this.logger)
      .provideValue(commonTokens.logger, this.logger)
      .provideValue(commonTokens.options, this.options);
  }
}

export const testInjector = new TestInjector();
testInjector.reset();
