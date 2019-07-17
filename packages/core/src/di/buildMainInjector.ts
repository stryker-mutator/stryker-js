import { coreTokens, PluginCreator } from '.';
import { commonTokens, Injector, OptionsContext, PluginKind, Scope, tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { rootInjector } from 'typed-inject';
import { getLogger } from 'log4js';
import { loggerFactory, pluginResolverFactory, optionsFactory, testFrameworkFactory } from './factoryMethods';
import { ConfigEditorApplier, readConfig } from '../config';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { Config } from '@stryker-mutator/api/config';
import ConfigReader from '../config/ConfigReader';
import Timer from '../utils/Timer';
import { TemporaryDirectory } from '../utils/TemporaryDirectory';

export interface MainContext extends OptionsContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.testFramework]: TestFramework | null;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.pluginCreatorMutator]: PluginCreator<PluginKind.Mutator>;
  [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework>;
  [coreTokens.timer]: Timer;
  [coreTokens.temporaryDirectory]: TemporaryDirectory;
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
    .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
    .provideClass(coreTokens.timer, Timer);
}

function pluginDescriptorsFactory(config: Config): ReadonlyArray<string> {
  config.plugins.push(
    require.resolve('../reporters')
  );
  return config.plugins;
}
pluginDescriptorsFactory.inject = tokens(coreTokens.configReadFromConfigFile);
