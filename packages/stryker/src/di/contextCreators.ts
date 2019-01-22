import { rootInjector, Scope, Injector } from 'typed-inject';
import * as coreTokens from './coreTokens';
import { commonTokens, PluginResolver, tokens, OptionsContext, PluginKind, BaseContext } from 'stryker-api/plugin';
import { getLogger, LoggerFactoryMethod } from 'stryker-api/logging';
import { PluginLoader } from './PluginLoader';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { PluginCreator } from './PluginCreator';
import { Config } from 'stryker-api/config';
import { StrykerOptions } from 'stryker-api/core';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { Reporter } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';

function pluginResolverFactory(injector: Injector<{ [coreTokens.pluginDescriptors]: ReadonlyArray<string> }>): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(commonTokens.injector);

function testFrameworkFactory(injector: Injector<OptionsContext & { [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework> }>) {
  return injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(commonTokens.injector);

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);

export interface CoreContext extends OptionsContext, PluginCreatorsContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.testFramework]: TestFramework | null;
}

export interface PluginCreatorsContext extends BaseContext {
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework>;
}

export function createCoreInjector(config: Config): Injector<CoreContext> {
  return createOptionsInjector(config)
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorConfigEditor, PluginCreator.createFactory(PluginKind.ConfigEditor))
    .provideFactory(coreTokens.pluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideFactory(coreTokens.testFramework, testFrameworkFactory);
}

export function createOptionsInjector(config: Config) {
  return createBaseInjector(config.plugins)
    .provideValue(commonTokens.config, config)
    .provideValue(commonTokens.options, config as StrykerOptions);
}

function createBaseInjector(pluginDescriptors: ReadonlyArray<string>): Injector<BaseContext> {
  return rootInjector
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideValue(coreTokens.pluginDescriptors, pluginDescriptors)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory);
}
