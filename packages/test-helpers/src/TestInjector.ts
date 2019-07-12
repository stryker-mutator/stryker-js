import { PluginResolver, OptionsContext, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, MutatorDescriptor } from '@stryker-mutator/api/core';
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
  private readonly provideMutatorDescriptor = () => {
    return this.mutatorDescriptor;
  }

  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: StrykerOptions;
  public mutatorDescriptor: MutatorDescriptor;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<OptionsContext> = rootInjector
    .provideValue(commonTokens.getLogger, this.provideLogger)
    .provideFactory(commonTokens.logger, this.provideLogger, Scope.Transient)
    .provideFactory(commonTokens.options, this.provideOptions, Scope.Transient)
    .provideFactory(commonTokens.pluginResolver, this.providePluginResolver, Scope.Transient)
    .provideFactory(commonTokens.mutatorDescriptor, this.provideMutatorDescriptor, Scope.Transient);

  public reset() {
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.pluginResolver = {
      resolve: sinon.stub(),
      resolveAll: sinon.stub()
    };
  }
}

export const testInjector = new TestInjector();
testInjector.reset();
