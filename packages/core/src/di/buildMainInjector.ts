import { StrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@stryker-mutator/api/config';
import { commonTokens, Injector, OptionsContext, PluginKind, Scope, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { ConfigEditorApplier, readConfig } from '../config';
import ConfigReader from '../config/ConfigReader';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { TemporaryDirectory } from '../utils/TemporaryDirectory';
import Timer from '../utils/Timer';
import { Statistics } from '../statistics/Statistics';

import { loggerFactory, mutatorDescriptorFactory, optionsFactory, pluginResolverFactory, testFrameworkFactory } from './factoryMethods';

import { coreTokens, PluginCreator } from '.';

export interface MainContext extends OptionsContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.testFramework]: TestFramework | null;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorConfigEditor]: PluginCreator<PluginKind.ConfigEditor>;
  [coreTokens.pluginCreatorMutator]: PluginCreator<PluginKind.Mutator>;
  [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework>;
  [coreTokens.timer]: Timer;
  [coreTokens.temporaryDirectory]: TemporaryDirectory;
  [coreTokens.statistics]: Statistics;
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
    .provideFactory(commonTokens.mutatorDescriptor, mutatorDescriptorFactory)
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideFactory(coreTokens.pluginCreatorMutator, PluginCreator.createFactory(PluginKind.Mutator))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideFactory(coreTokens.testFramework, testFrameworkFactory)
    .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
    .provideClass(coreTokens.timer, Timer)
    .provideValue(coreTokens.httpClient, new HttpClient('main-injector-httpclient'))
    .provideClass(coreTokens.statistics, Statistics);
}

function pluginDescriptorsFactory(config: Config): readonly string[] {
  config.plugins.push(require.resolve('../reporters'));
  return config.plugins;
}
pluginDescriptorsFactory.inject = tokens(coreTokens.configReadFromConfigFile);
