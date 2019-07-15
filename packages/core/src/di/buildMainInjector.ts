import { coreTokens, PluginCreator } from '.';
import { COMMON_TOKENS, Injector, OptionsContext, PluginKind, Scope, tokens } from '@stryker-mutator/api/plugin';
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

export interface MainContext extends OptionsContext {
  [coreTokens.Reporter]: Required<Reporter>;
  [coreTokens.TestFramework]: TestFramework | null;
  [coreTokens.PluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.PluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.PluginCreatorMutator]: PluginCreator<PluginKind.Mutator>;
  [coreTokens.PluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework>;
  [coreTokens.Timer]: Timer;
}

export function buildMainInjector(cliOptions: Partial<StrykerOptions>): Injector<MainContext> {
  return rootInjector
    .provideValue(COMMON_TOKENS.getLogger, getLogger)
    .provideFactory(COMMON_TOKENS.logger, loggerFactory, Scope.Transient)
    .provideValue(coreTokens.CliOptions, cliOptions)
    .provideClass(coreTokens.ConfigReader, ConfigReader)
    .provideFactory(coreTokens.ConfigReadFromConfigFile, readConfig)
    .provideFactory(coreTokens.PluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(COMMON_TOKENS.pluginResolver, pluginResolverFactory)
    .provideFactory(coreTokens.PluginCreatorConfigEditor, PluginCreator.createFactory(PluginKind.ConfigEditor))
    .provideClass(coreTokens.ConfigEditorApplier, ConfigEditorApplier)
    .provideFactory(COMMON_TOKENS.options, optionsFactory)
    .provideFactory(coreTokens.PluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.PluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideFactory(coreTokens.PluginCreatorMutator, PluginCreator.createFactory(PluginKind.Mutator))
    .provideClass(coreTokens.Reporter, BroadcastReporter)
    .provideFactory(coreTokens.TestFramework, testFrameworkFactory)
    .provideClass(coreTokens.Timer, Timer);
}

function pluginDescriptorsFactory(config: Config): ReadonlyArray<string> {
  config.plugins.push(
    require.resolve('../reporters')
  );
  return config.plugins;
}
pluginDescriptorsFactory.inject = tokens(coreTokens.ConfigReadFromConfigFile);
