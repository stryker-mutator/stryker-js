import execa = require('execa');
import { StrykerOptions, strykerCoreSchema, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';

import { readConfig, buildSchemaWithPluginContributions, OptionsValidator, validateOptions, markUnknownOptions } from '../config';
import ConfigReader from '../config/ConfigReader';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { TemporaryDirectory } from '../utils/TemporaryDirectory';
import Timer from '../utils/Timer';

import { pluginResolverFactory } from './factoryMethods';

import { coreTokens, PluginCreator } from '.';

export interface MainContext extends PluginContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorChecker]: PluginCreator<PluginKind.Checker>;
  [coreTokens.timer]: Timer;
  [coreTokens.temporaryDirectory]: TemporaryDirectory;
  [coreTokens.execa]: typeof execa;
}

type PluginResolverProvider = Injector<PluginContext>;
export type CliOptionsProvider = Injector<Pick<MainContext, 'logger' | 'getLogger'> & { [coreTokens.cliOptions]: PartialStrykerOptions }>;

buildMainInjector.inject = tokens(commonTokens.injector);
export function buildMainInjector(injector: CliOptionsProvider): Injector<MainContext> {
  const pluginResolverProvider = createPluginResolverProvider(injector);
  return pluginResolverProvider
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorChecker, PluginCreator.createFactory(PluginKind.Checker))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
    .provideClass(coreTokens.timer, Timer)
    .provideValue(coreTokens.execa, execa);
}

export function createPluginResolverProvider(parent: CliOptionsProvider): PluginResolverProvider {
  return parent
    .provideValue(coreTokens.validationSchema, strykerCoreSchema)
    .provideClass(coreTokens.optionsValidator, OptionsValidator)
    .provideClass(coreTokens.configReader, ConfigReader)
    .provideFactory(commonTokens.options, readConfig)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory)
    .provideFactory(coreTokens.validationSchema, buildSchemaWithPluginContributions)
    .provideClass(coreTokens.optionsValidator, OptionsValidator)
    .provideFactory(commonTokens.options, validateOptions)
    .provideFactory(commonTokens.options, markUnknownOptions);
}

function pluginDescriptorsFactory(options: StrykerOptions): readonly string[] {
  options.plugins.push(require.resolve('../reporters'));
  return options.plugins;
}
pluginDescriptorsFactory.inject = tokens(commonTokens.options);
