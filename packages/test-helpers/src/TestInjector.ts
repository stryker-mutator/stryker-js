import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginContext, PluginResolver } from '@stryker-mutator/api/plugin';
import * as sinon from 'sinon';
import { Injector, createInjector } from 'typed-inject';

import * as factory from './factory';

class TestInjector {
  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: StrykerOptions;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<PluginContext>;

  public reset() {
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.pluginResolver = factory.pluginResolver();
    this.injector = createInjector()
      .provideValue(commonTokens.getLogger, () => this.logger)
      .provideValue(commonTokens.logger, this.logger)
      .provideValue(commonTokens.options, this.options)
      .provideValue(commonTokens.pluginResolver, this.pluginResolver);
  }
}

export const testInjector = new TestInjector();
testInjector.reset();
