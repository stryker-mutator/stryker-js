import { COMMON_TOKENS, Scope, Injector, OptionsContext, tokens } from '@stryker-mutator/api/plugin';
import { pluginResolverFactory, loggerFactory } from './factoryMethods';
import { coreTokens } from '.';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';
import { StrykerOptions } from '@stryker-mutator/api/core';

export function buildChildProcessInjector(options: StrykerOptions): Injector<OptionsContext> {
  return rootInjector
    .provideValue(COMMON_TOKENS.options, options)
    .provideValue(COMMON_TOKENS.getLogger, getLogger)
    .provideFactory(COMMON_TOKENS.logger, loggerFactory, Scope.Transient)
    .provideFactory(coreTokens.PluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(COMMON_TOKENS.pluginResolver, pluginResolverFactory);
}

function pluginDescriptorsFactory(options: StrykerOptions): ReadonlyArray<string> {
  return options.plugins;
}
pluginDescriptorsFactory.inject = tokens(COMMON_TOKENS.options);
