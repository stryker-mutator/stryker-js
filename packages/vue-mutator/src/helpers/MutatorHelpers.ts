import { Mutator } from '@stryker-mutator/api/mutant';
import { commonTokens, FactoryPlugin, InjectionToken, Injector, OptionsContext, Plugin, PluginKind, PluginResolver, tokens } from '@stryker-mutator/api/plugin';

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

function createPlugin(injector: Injector<OptionsContext>, plugin: Plugin<PluginKind.Mutator>): Mutator {
  if (isFactoryPlugin(plugin)) {
    return injector.injectFunction(plugin.factory);
  } else {
    return injector.injectClass(plugin.injectableClass);
  }
}

function isFactoryPlugin(plugin: Plugin<PluginKind.Mutator>):
  plugin is FactoryPlugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]> {
  return !!(plugin as FactoryPlugin<PluginKind.Mutator, InjectionToken<OptionsContext>[]>).factory;
}
