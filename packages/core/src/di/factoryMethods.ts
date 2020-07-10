import { MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { commonTokens, Injector, PluginResolver, tokens } from '@stryker-mutator/api/plugin';

import { coreTokens, PluginLoader } from '.';

export function pluginResolverFactory(
  injector: Injector<{ [commonTokens.logger]: Logger; [coreTokens.pluginDescriptors]: readonly string[] }>
): PluginResolver {
  const pluginLoader = injector.injectClass(PluginLoader);
  pluginLoader.load();
  return pluginLoader;
}
pluginResolverFactory.inject = tokens(commonTokens.injector);

// eslint-disable-next-line @typescript-eslint/ban-types
export function loggerFactory(getLogger: LoggerFactoryMethod, target: Function | undefined) {
  return getLogger(target ? target.name : 'UNKNOWN');
}
loggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);

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
