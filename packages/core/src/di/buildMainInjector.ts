import { StrykerOptions, strykerCoreSchema, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, OptionsContext, PluginKind, Scope, tokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';

import {
  OptionsEditorApplier,
  readConfig,
  buildSchemaWithPluginContributions,
  OptionsValidator,
  validateOptions,
  markUnknownOptions,
} from '../config';
import ConfigReader from '../config/ConfigReader';
import BroadcastReporter from '../reporters/BroadcastReporter';
import { TemporaryDirectory } from '../utils/TemporaryDirectory';
import Timer from '../utils/Timer';

import { loggerFactory, mutatorDescriptorFactory, applyOptionsEditors, pluginResolverFactory, testFrameworkFactory } from './factoryMethods';

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
}

type BasicInjector = Injector<Pick<MainContext, 'logger' | 'getLogger'>>;
type PluginResolverInjector = Injector<Pick<MainContext, 'logger' | 'getLogger' | 'options' | 'pluginResolver'>>;

export function buildMainInjector(cliOptions: PartialStrykerOptions): Injector<MainContext> {
  const basicInjector = createBasicInjector();
  const pluginResolverInjector = createPluginResolverInjector(cliOptions, basicInjector);
  return pluginResolverInjector
    .provideFactory(commonTokens.mutatorDescriptor, mutatorDescriptorFactory)
    .provideFactory(coreTokens.pluginCreatorReporter, PluginCreator.createFactory(PluginKind.Reporter))
    .provideFactory(coreTokens.pluginCreatorTestFramework, PluginCreator.createFactory(PluginKind.TestFramework))
    .provideFactory(coreTokens.pluginCreatorMutator, PluginCreator.createFactory(PluginKind.Mutator))
    .provideClass(coreTokens.reporter, BroadcastReporter)
    .provideFactory(coreTokens.testFramework, testFrameworkFactory)
    .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
    .provideClass(coreTokens.timer, Timer);
}

function createBasicInjector(): BasicInjector {
  return rootInjector.provideValue(commonTokens.getLogger, getLogger).provideFactory(commonTokens.logger, loggerFactory, Scope.Transient);
}

export function createPluginResolverInjector(cliOptions: PartialStrykerOptions, parent: BasicInjector): PluginResolverInjector {
  return parent
    .provideValue(coreTokens.cliOptions, cliOptions)
    .provideValue(coreTokens.validationSchema, strykerCoreSchema)
    .provideClass(coreTokens.optionsValidator, OptionsValidator)
    .provideClass(coreTokens.configReader, ConfigReader)
    .provideFactory(commonTokens.options, readConfig)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory)
    .provideFactory(coreTokens.validationSchema, buildSchemaWithPluginContributions)
    .provideClass(coreTokens.optionsValidator, OptionsValidator)
    .provideFactory(commonTokens.options, validateOptions)
    .provideFactory(commonTokens.options, markUnknownOptions)
    .provideFactory(coreTokens.pluginCreatorConfigEditor, PluginCreator.createFactory(PluginKind.ConfigEditor))
    .provideFactory(coreTokens.pluginCreatorOptionsEditor, PluginCreator.createFactory(PluginKind.OptionsEditor))
    .provideClass(coreTokens.configOptionsApplier, OptionsEditorApplier)
    .provideFactory(commonTokens.options, applyOptionsEditors);
}

function pluginDescriptorsFactory(options: StrykerOptions): readonly string[] {
  options.plugins.push(require.resolve('../reporters'));
  return options.plugins;
}
pluginDescriptorsFactory.inject = tokens(commonTokens.options);
