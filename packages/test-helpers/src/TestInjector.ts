import { MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, PluginContext, PluginResolver } from '@stryker-mutator/api/plugin';
import sinon from 'sinon';
import { Injector, createInjector, Scope } from 'typed-inject';

import * as factory from './factory';

class TestInjector {
  private readonly providePluginResolver = (): PluginResolver => {
    return this.pluginResolver;
  };
  private readonly provideLogger = (): Logger => {
    return this.logger;
  };
  private readonly provideOptions = () => {
    return this.options;
  };
  private readonly provideMutatorDescriptor = () => {
    return this.mutatorDescriptor;
  };

  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: StrykerOptions;
  public mutatorDescriptor: MutatorDescriptor;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<PluginContext> = createInjector()
    .provideValue(commonTokens.getLogger, this.provideLogger)
    .provideFactory(commonTokens.logger, this.provideLogger, Scope.Transient)
    .provideFactory(commonTokens.options, this.provideOptions, Scope.Transient)
    .provideFactory(commonTokens.pluginResolver, this.providePluginResolver, Scope.Transient)
    .provideFactory(commonTokens.mutatorDescriptor, this.provideMutatorDescriptor, Scope.Transient);

  public reset() {
    this.mutatorDescriptor = factory.mutatorDescriptor();
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.pluginResolver = factory.pluginResolver();
  }
}

export const testInjector = new TestInjector();
testInjector.reset();
