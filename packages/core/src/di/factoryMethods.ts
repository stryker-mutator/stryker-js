import { MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, OptionsContext, PluginKind, PluginResolver, tokens } from '@stryker-mutator/api/plugin';
import { deepFreeze } from '@stryker-mutator/util';

import { OptionsEditorApplier } from '../config';
import TestFrameworkOrchestrator from '../TestFrameworkOrchestrator';

import { coreTokens, PluginCreator, PluginLoader } from '.';

export function pluginResolverFactory(
  injector: Injector<{ [commonTokens.logger]: Logger; [coreTokens.pluginDescriptors]: readonly string[] }>
): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(commonTokens.injector);

export function testFrameworkFactory(
  injector: Injector<OptionsContext & { [coreTokens.pluginCreatorTestFramework]: PluginCreator<PluginKind.TestFramework> }>
) {
  return injector.injectClass(TestFrameworkOrchestrator).determineTestFramework();
}
testFrameworkFactory.inject = tokens(commonTokens.injector);

// eslint-disable-next-line @typescript-eslint/ban-types
export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);

export function applyOptionsEditors(options: StrykerOptions, optionsEditorApplier: OptionsEditorApplier): StrykerOptions {
  optionsEditorApplier.edit(options);
  return deepFreeze(options) as StrykerOptions;
}
applyOptionsEditors.inject = tokens(commonTokens.options, coreTokens.configOptionsApplier);

export function mutatorDescriptorFactory(options: StrykerOptions): MutatorDescriptor {
  const defaults: MutatorDescriptor = {
    plugins: null,
    name: 'javascript',
    excludedMutations: [],
  };
  if (typeof options.mutator === 'string') {
    return {
      ...defaults,
      name: options.mutator,
    };
  }

  return {
    ...defaults,
    ...options.mutator,
  };
}
mutatorDescriptorFactory.inject = tokens(commonTokens.options);
