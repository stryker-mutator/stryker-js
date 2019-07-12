import { Plugin, PluginKind, PluginContexts, PluginInterfaces, FactoryPlugin, ClassPlugin, PluginResolver, tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Injector, InjectionToken, InjectableFunctionWithInject } from 'typed-inject';

export class PluginCreator<TPluginKind extends PluginKind> {

  private constructor(
    private readonly kind: TPluginKind,
    private readonly pluginResolver: PluginResolver,
    private readonly injector: Injector<PluginContexts[TPluginKind]>) {
  }

  public create(name: string): PluginInterfaces[TPluginKind] {
    const plugin = this.pluginResolver.resolve(this.kind, name);
    if (this.isFactoryPlugin(plugin)) {
      return this.injector.injectFunction(plugin.factory);
    } else if (this.isClassPlugin(plugin)) {
      return this.injector.injectClass(plugin.injectableClass);
    } else {
      throw new Error(`Plugin "${this.kind}:${name}" could not be created, missing "factory" or "injectableClass" property.`);
    }
  }

  private isFactoryPlugin(plugin: Plugin<PluginKind>):
    plugin is FactoryPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]> {
    return !!(plugin as FactoryPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>).factory;
  }
  private isClassPlugin(plugin: Plugin<PluginKind>):
    plugin is ClassPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]> {
    return !!(plugin as ClassPlugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>).injectableClass;
  }

  public static createFactory<TPluginKind extends PluginKind, TContext extends PluginContexts[TPluginKind]>(kind: TPluginKind)
  : InjectableFunctionWithInject<TContext, PluginCreator<TPluginKind>, [typeof commonTokens.pluginResolver, typeof commonTokens.injector]> {
    function factory(pluginResolver: PluginResolver, injector: Injector<TContext>): PluginCreator<TPluginKind> {
      return new PluginCreator(kind, pluginResolver, injector);
    }
    factory.inject = tokens(commonTokens.pluginResolver, commonTokens.injector);
    return factory;
  }
}
