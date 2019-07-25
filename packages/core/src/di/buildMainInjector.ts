import { Config } from '@stryker-mutator/api/config';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, OptionsContext, PluginKind, Scope, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';
import { coreTokens, PluginCreator } from '.';
import { ConfigEditorApplier, readConfig } from '../config';
import ConfigReader from '../config/ConfigReader';
import BroadcastReporter from '../reporters/BroadcastReporter';
import Timer from '../utils/Timer';
import { loggerFactory, optionsFactory, pluginResolverFactory, testFrameworkFactory } from './factoryMethods';

export interface MainContext extends OptionsContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.testFramework]: TestFramework | null;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.pluginCreatorMutator]: PluginCreator<PluginKind.Mutator>;
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
    .provideFactory(commonTokens.options, optionsFactory)
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideFactory(coreTokens.pluginCreatorMutator, PluginCreator.createFactory(PluginKind.Mutator))
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
