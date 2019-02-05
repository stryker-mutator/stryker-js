import { coreTokens, PluginCreator } from '.';
import { commonTokens, Injector, OptionsContext, PluginKind, Scope, tokens } from 'stryker-api/plugin';
import { StrykerOptions } from 'stryker-api/core';
import { Reporter } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { rootInjector } from 'typed-inject';
import { getLogger } from 'stryker-api/logging';
import { loggerFactory, pluginResolverFactory, optionsFactory, testFrameworkFactory } from './factoryMethods';
import { ConfigEditorApplier, configFactory, readConfig } from '../config';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { Config } from 'stryker-api/config';
import ConfigReader from '../config/ConfigReader';
import Timer from '../utils/Timer';

export interface MainContext extends OptionsContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.testFramework]: TestFramework | null;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework>;
  [coreTokens.timer]: Timer;
}

export function buildMainInjector(cliOptions: Partial<StrykerOptions>): Injector<MainContext> {
  return rootInjector
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideValue(coreTokens.cliOptions, cliOptions)
    .provideClass(coreTokens.configReader, ConfigReader)
    .provideFactory(coreTokens.configReadFromConfigFile, readConfig)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory)
    .provideFactory(coreTokens.pluginCreatorConfigEditor, PluginCreator.createFactory(PluginKind.ConfigEditor))
    .provideClass(coreTokens.configEditorApplier, ConfigEditorApplier)
    .provideFactory(commonTokens.config, configFactory)
    .provideFactory(commonTokens.options, optionsFactory)
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideFactory(coreTokens.testFramework, testFrameworkFactory)
    .provideClass(coreTokens.timer, Timer);
}

function pluginDescriptorsFactory(config: Config): ReadonlyArray<string> {
  config.plugins.push(
    require.resolve('../reporters')
  );
  return config.plugins;
}
pluginDescriptorsFactory.inject = tokens(coreTokens.configReadFromConfigFile);
