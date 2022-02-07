import {
  Plugins,
  PluginInterfaces,
  PluginContext,
  Injector,
  Plugin,
  PluginKind,
  ClassPlugin,
  FactoryPlugin,
  InjectionToken,
  tokens,
  commonTokens,
} from '@stryker-mutator/api/plugin';
import { InjectableFunction, InjectableClass } from 'typed-inject';

import { PluginLoader } from './plugin-loader.js';

import { coreTokens } from './index.js';

export class PluginCreator {
  public static readonly inject = tokens(coreTokens.pluginLoader, commonTokens.injector);
  constructor(private readonly pluginLoader: Pick<PluginLoader, 'resolve'>, private readonly injector: Injector<PluginContext>) {}

  public create<TPlugin extends keyof Plugins>(kind: TPlugin, name: string): PluginInterfaces[TPlugin] {
    const plugin = this.pluginLoader.resolve(kind, name);
    if (isFactoryPlugin(plugin)) {
      return this.injector.injectFunction(
        plugin.factory as InjectableFunction<PluginContext, PluginInterfaces[TPlugin], Array<InjectionToken<PluginContext>>>
      );
    } else if (isClassPlugin(plugin)) {
      return this.injector.injectClass(
        plugin.injectableClass as InjectableClass<PluginContext, PluginInterfaces[TPlugin], Array<InjectionToken<PluginContext>>>
      );
    } else {
      throw new Error(`Plugin "${kind}:${name}" could not be created, missing "factory" or "injectableClass" property.`);
    }
  }
}

function isFactoryPlugin(plugin: Plugin<PluginKind>): plugin is FactoryPlugin<PluginKind, Array<InjectionToken<PluginContext>>> {
  return !!(plugin as FactoryPlugin<PluginKind, Array<InjectionToken<PluginContext>>>).factory;
}
function isClassPlugin(plugin: Plugin<PluginKind>): plugin is ClassPlugin<PluginKind, Array<InjectionToken<PluginContext>>> {
  return !!(plugin as ClassPlugin<PluginKind, Array<InjectionToken<PluginContext>>>).injectableClass;
}
