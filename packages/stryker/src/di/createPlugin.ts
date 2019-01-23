import { Plugin, PluginKind, PluginContexts, Plugins, PluginInterfaces, FactoryPlugin, ClassPlugin } from 'stryker-api/plugin';
import { Injector, InjectionToken } from 'typed-inject';

export function createPlugin<TPluginKind extends PluginKind>(kind: TPluginKind, plugin: Plugins[TPluginKind], injector: Injector<PluginContexts[TPluginKind]>):
  PluginInterfaces[TPluginKind] {
  if (isFactoryPlugin(plugin)) {
    return injector.injectFunction(plugin.factory);
  } else if (isClassPlugin(plugin)) {
    return injector.injectClass(plugin.injectableClass);
  } else {
    throw new Error(`Plugin "${kind}:${plugin.name}" could not be created, missing "factory" or "injectableClass" property.`);
  }
}

function isFactoryPlugin<TPluginKind extends PluginKind>(plugin: Plugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>):
  plugin is FactoryPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]> {
  return !!(plugin as FactoryPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>).factory;
}
function isClassPlugin<TPluginKind extends PluginKind>(plugin: Plugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>):
  plugin is ClassPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]> {
  return !!(plugin as ClassPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>).injectableClass;
}
