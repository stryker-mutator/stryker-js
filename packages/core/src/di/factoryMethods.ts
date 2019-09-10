import { Config } from '@stryker-mutator/api/config';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, OptionsContext, PluginKind, PluginResolver, tokens } from '@stryker-mutator/api/plugin';
import { coreTokens, PluginCreator, PluginLoader } from '.';
import { ConfigEditorApplier } from '../config';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';
import { freezeRecursively } from '../utils/objectUtils';

export function pluginResolverFactory(injector: Injector<{ [commonTokens.logger]: Logger, [coreTokens.pluginDescriptors]: ReadonlyArray<string> }>): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(commonTokens.injector);

export function testFrameworkFactory(injector: Injector<OptionsContext & { [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework> }>) {
  return injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(commonTokens.injector);

export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);

export function optionsFactory(config: Config, configEditorApplier: ConfigEditorApplier): StrykerOptions {
  configEditorApplier.edit(config);
  return freezeRecursively(config);
}
optionsFactory.inject = tokens<[typeof coreTokens.configReadFromConfigFile, typeof coreTokens.configEditorApplier]>(coreTokens.configReadFromConfigFile, coreTokens.configEditorApplier);

export function mutatorDescriptorFactory(options: StrykerOptions): MutatorDescriptor {
  if (typeof options.mutator === 'string') {
    return {
      babelPlugins: [],
      excludedMutations: [],
      name: options.mutator
    };
  }

  return options.mutator;
}
mutatorDescriptorFactory.inject = tokens(commonTokens.options);
