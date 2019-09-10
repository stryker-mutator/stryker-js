import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, OptionsContext, Scope, tokens } from '@stryker-mutator/api/plugin';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';
import { coreTokens } from '.';
import { loggerFactory, pluginResolverFactory } from './factoryMethods';

export function buildChildProcessInjector(options: StrykerOptions): Injector<OptionsContext> {
  return rootInjector
    .provideValue(commonTokens.options, options)
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory)
    .provideFactory(commonTokens.mutatorDescriptor, mutatorDescriptorFactory);
}

function pluginDescriptorsFactory(options: StrykerOptions): ReadonlyArray<string> {
  return options.plugins;
}

pluginDescriptorsFactory.inject = tokens(commonTokens.options);
