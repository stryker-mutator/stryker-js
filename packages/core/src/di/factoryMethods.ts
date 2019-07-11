import { tokens, commonTokens, OptionsContext, Injector, PluginKind, PluginResolver } from '@stryker-mutator/api/plugin';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { coreTokens, PluginCreator, PluginLoader } from '.';
import { LoggerFactoryMethod, Logger } from '@stryker-mutator/api/logging';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@stryker-mutator/api/config';
import { ConfigEditorApplier } from '../config';
import { freezeRecursively } from '../utils/objectUtils';

export function pluginResolverFactory(injector: Injector<{ [commonTokens.logger]: Logger, [coreTokens.pluginDescriptors]: ReadonlyArray<string> }>): PluginResolver {
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

export function optionsFactory(config: Config, configEditorApplier: ConfigEditorApplier): StrykerOptions {
  configEditorApplier.edit(config);
  return freezeRecursively(config);
}
optionsFactory.inject = tokens<[typeof coreTokens.configReadFromConfigFile, typeof coreTokens.configEditorApplier]>(coreTokens.configReadFromConfigFile, coreTokens.configEditorApplier);
