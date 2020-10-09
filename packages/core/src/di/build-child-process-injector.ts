import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import { createInjector } from 'typed-inject';

import { pluginResolverFactory } from './factory-methods';

import { coreTokens, provideLogger } from '.';

export function buildChildProcessInjector(options: StrykerOptions): Injector<PluginContext> {
  return provideLogger(createInjector())
    .provideValue(commonTokens.options, options)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory);
}

function pluginDescriptorsFactory(options: StrykerOptions): readonly string[] {
  return options.plugins;
}

pluginDescriptorsFactory.inject = tokens(commonTokens.options);
