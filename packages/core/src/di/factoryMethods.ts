import { tokens, COMMON_TOKENS, OptionsContext, Injector, PluginKind, PluginResolver } from '@stryker-mutator/api/plugin';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { coreTokens, PluginCreator, PluginLoader } from '.';
import { LoggerFactoryMethod, Logger } from '@stryker-mutator/api/logging';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@stryker-mutator/api/config';
import { ConfigEditorApplier } from '../config';
import { freezeRecursively } from '../utils/objectUtils';

export function pluginResolverFactory(injector: Injector<{ [COMMON_TOKENS.logger]: Logger, [coreTokens.PluginDescriptors]: ReadonlyArray<string> }>): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(COMMON_TOKENS.injector);

export function testFrameworkFactory(injector: Injector<OptionsContext & { [coreTokens.PluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework> }>) {
  return injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(COMMON_TOKENS.injector);

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(COMMON_TOKENS.getLogger, COMMON_TOKENS.target);

export function optionsFactory(config: Config, configEditorApplier: ConfigEditorApplier): StrykerOptions {
  configEditorApplier.edit(config);
  return freezeRecursively(config);
}
optionsFactory.inject = tokens<[typeof coreTokens.ConfigReadFromConfigFile, typeof coreTokens.ConfigEditorApplier]>(coreTokens.ConfigReadFromConfigFile, coreTokens.ConfigEditorApplier);
