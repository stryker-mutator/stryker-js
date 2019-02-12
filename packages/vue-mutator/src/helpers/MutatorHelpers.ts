import { Mutator } from '@stryker-mutator/api/mutant';
import { PluginResolver, Injector, OptionsContext, PluginKind, InjectionToken, Plugin, FactoryPlugin, tokens, commonTokens } from '@stryker-mutator/api/plugin';

export const MUTATORS_TOKEN = 'mutators';

mutatorsFactory.inject = tokens(commonTokens.pluginResolver, commonTokens.injector);
export function mutatorsFactory(pluginResolver: PluginResolver, injector: Injector<OptionsContext>) {
  const mutators: { [name: string]: Mutator; } = {};
  const mutatorPlugins = pluginResolver.resolveAll(PluginKind.Mutator);
  mutatorPlugins.forEach(plugin => {
    if (plugin.name !== 'vue') {
      mutators[plugin.name] = createPlugin(injector, plugin);
    }
  });
  return mutators;
}

function createPlugin(injector: Injector<OptionsContext>, plugin: Plugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]>): Mutator {
  if (isFactoryPlugin(plugin)) {
    return injector.injectFunction(plugin.factory);
  } else {
    return injector.injectClass(plugin.injectableClass);
  }
}

function isFactoryPlugin(plugin: Plugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]>):
  plugin is FactoryPlugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]> {
  return !!(plugin as FactoryPlugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]>).factory;
}
