import { Config } from 'stryker-api/config';
import { commonTokens, Scope, Injector, OptionsContext, tokens } from 'stryker-api/plugin';
import { optionsFactory, pluginResolverFactory, loggerFactory } from './factoryMethods';
import { coreTokens } from '.';
import { getLogger } from 'stryker-api/logging';
import { rootInjector } from 'typed-inject';

export function buildChildProcessInjector(config: Config): Injector<OptionsContext> {
  return rootInjector
    .provideValue(commonTokens.config, config)
    .provideFactory(commonTokens.options, optionsFactory)
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory, Scope.Transient)
    .provideFactory(coreTokens.pluginDescriptors, pluginDescriptorsFactory)
    .provideFactory(commonTokens.pluginResolver, pluginResolverFactory);
}

function pluginDescriptorsFactory(config: Config): ReadonlyArray<string> {
  return config.plugins;
}
pluginDescriptorsFactory.inject = tokens(commonTokens.config);
