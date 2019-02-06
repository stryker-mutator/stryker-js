import { PluginResolver, OptionsContext, commonTokens } from 'stryker-api/plugin';
import { StrykerOptions } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import * as factory from './factory';
import * as sinon from 'sinon';
import { rootInjector, Injector, Scope } from 'typed-inject';
import { Config } from 'stryker-api/config';

class TestInjector {

  private readonly providePluginResolver = (): PluginResolver => {
    return this.pluginResolver;
  }
  private readonly provideLogger = (): Logger => {
    return this.logger;
  }
  private readonly provideConfig = () => {
    const config = new Config();
    config.set(this.options);
    return config;
  }
  private readonly provideOptions = () => {
    return this.options;
  }

  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: StrykerOptions;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<OptionsContext> = rootInjector
    .provideValue(commonTokens.getLogger, this.provideLogger)
    .provideFactory(commonTokens.logger, this.provideLogger, Scope.Transient)
    .provideFactory(commonTokens.options, this.provideOptions, Scope.Transient)
    .provideFactory(commonTokens.config, this.provideConfig, Scope.Transient)
    .provideFactory(commonTokens.pluginResolver, this.providePluginResolver, Scope.Transient);

  public reset() {
    this.options = factory.strykerOptions();
    this.logger = factory.logger();
    this.pluginResolver = {
      resolve: sinon.stub(),
      resolveAll: sinon.stub()
    };
  }
}

const testInjector = new TestInjector();
testInjector.reset();
export default testInjector;
