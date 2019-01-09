import { PluginResolver, PluginContext } from 'stryker-api/plugin';
import { StrykerOptions } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import * as factory from './factory';
import * as sinon from 'sinon';
import { rootInjector, Injector, Scope } from 'typed-inject';
import { Config } from 'stryker-api/config';

class TestInjector {

  public providePluginResolver = (): PluginResolver => {
    return this.pluginResolver;
  }
  public provideLogger = (): Logger => {
    return this.logger;
  }
  public provideConfig = () => {
    const config = new Config();
    config.set(this.provideOptions());
    return config;
  }

  public provideOptions = () => {
    return factory.strykerOptions(this.options);
  }

  public pluginResolver: sinon.SinonStubbedInstance<PluginResolver>;
  public options: Partial<StrykerOptions>;
  public logger: sinon.SinonStubbedInstance<Logger>;
  public injector: Injector<PluginContext> = rootInjector
    .provideValue('getLogger', this.provideLogger)
    .provideFactory('logger', this.provideLogger, Scope.Transient)
    .provideFactory('options', this.provideOptions, Scope.Transient)
    .provideFactory('config', this.provideConfig, Scope.Transient)
    .provideFactory('pluginResolver', this.providePluginResolver, Scope.Transient);

  public reset() {
    this.options = {};
    this.logger = factory.logger();
    this.pluginResolver = {
      resolve: sinon.stub()
    };
  }
}

const testInjector = new TestInjector();
testInjector.reset();
export default testInjector;
