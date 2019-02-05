import { tokens, commonTokens, OptionsContext, Injector, PluginKind, PluginResolver } from 'stryker-api/plugin';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { coreTokens, PluginCreator, PluginLoader } from '.';
import { LoggerFactoryMethod } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';

export function pluginResolverFactory(injector: Injector<{ [coreTokens.pluginDescriptors]: ReadonlyArray<string> }>): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(commonTokens.injector);

export function testFrameworkFactory(injector: Injector<OptionsContext & { [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework> }>) {
  return injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(commonTokens.injector);

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);

export function optionsFactory(config: Config) {
  return config;
}
optionsFactory.inject = tokens(commonTokens.config);
