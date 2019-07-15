import { PluginResolver, OptionsContext, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import * as factory from './factory';
import * as sinon from 'sinon';
import { rootInjector, Injector, Scope } from 'typed-inject';

class TestInjector {

  private readonly providePluginResolver = (): PluginResolver => {
    return this.pluginResolver;
  }
  private readonly provideLogger = (): Logger => {
    return this.logger;
  }
  private readonly provideOptions = () => {
    return this.options;
  }

  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: StrykerOptions;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<OptionsContext> = rootInjector
    .provideValue(COMMON_TOKENS.getLogger, this.provideLogger)
    .provideFactory(COMMON_TOKENS.logger, this.provideLogger, Scope.Transient)
    .provideFactory(COMMON_TOKENS.options, this.provideOptions, Scope.Transient)
    .provideFactory(COMMON_TOKENS.pluginResolver, this.providePluginResolver, Scope.Transient);

  public reset() {
    this.options = factory.STRYKER_OPTIONS();
    this.logger = factory.logger();
    this.pluginResolver = {
      resolve: sinon.stub(),
      resolveAll: sinon.stub()
    };
  }
}

export const TEST_INJECTOR = new TestInjector();
TEST_INJECTOR.reset();
