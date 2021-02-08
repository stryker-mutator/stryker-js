import execa from 'execa';
import { StrykerOptions, strykerCoreSchema, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { I } from '@stryker-mutator/util';

import { readConfig, buildSchemaWithPluginContributions, OptionsValidator, validateOptions, markUnknownOptions } from '../config';
import { ConfigReader } from '../config/config-reader';
import { BroadcastReporter } from '../reporters/broadcast-reporter';
import { TemporaryDirectory } from '../utils/temporary-directory';
import { Timer } from '../utils/timer';
import { UnexpectedExitHandler } from '../unexpected-exit-handler';

import { pluginResolverFactory } from './factory-methods';

import { coreTokens, PluginCreator } from '.';

export interface MainContext extends PluginContext {
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.pluginCreatorReporter]: PluginCreator<PluginKind.Reporter>;
  [coreTokens.pluginCreatorChecker]: PluginCreator<PluginKind.Checker>;
  [coreTokens.timer]: I<Timer>;
  [coreTokens.temporaryDirectory]: I<TemporaryDirectory>;
  [coreTokens.execa]: typeof execa;
  [coreTokens.process]: NodeJS.Process;
  [coreTokens.unexpectedExitRegistry]: I<UnexpectedExitHandler>;
}

type PluginResolverProvider = Injector<PluginContext>;

export type CliOptionsProvider = Injector<Pick<MainContext, 'getLogger' | 'logger'> & { [coreTokens.cliOptions]: PartialStrykerOptions }>;
buildMainInjector.inject = tokens(commonTokens.injector);
export function buildMainInjector(injector: CliOptionsProvider): Injector<MainContext> {
  const pluginResolverProvider = createPluginResolverProvider(injector);
  return pluginResolverProvider
    .provideValue(coreTokens.timer, new Timer()) // greedy initialize, so the time starts immediately
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorChecker, PluginCreator.createFactory(PluginKind.Checker))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
    .provideValue(coreTokens.execa, execa)
    .provideValue(coreTokens.process, process)
    .provideClass(coreTokens.unexpectedExitRegistry, UnexpectedExitHandler);
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
  options.plugins = options.plugins.concat(options.appendPlugins);
  return options.plugins;
}
pluginDescriptorsFactory.inject = tokens(commonTokens.options);
