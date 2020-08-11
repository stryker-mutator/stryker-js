import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, Scope, tokens } from '@stryker-mutator/api/plugin';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';

import { loggerFactory, mutatorDescriptorFactory, pluginResolverFactory } from './factoryMethods';

import { coreTokens } from '.';

export function buildChildProcessInjector(options: StrykerOptions): Injector<PluginContext> {
  return rootInjector
    .provideValue(commonTokens.options, options)
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory)
    .provideFactory(commonTokens.mutatorDescriptor, mutatorDescriptorFactory);
}

function pluginDescriptorsFactory(options: StrykerOptions): readonly string[] {
  return options.plugins;
}

pluginDescriptorsFactory.inject = tokens(commonTokens.options);
