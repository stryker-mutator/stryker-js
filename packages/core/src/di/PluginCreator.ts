import {
  ClassPlugin,
  commonTokens,
  FactoryPlugin,
  Plugin,
  PluginContexts,
  PluginInterfaces,
  PluginKind,
  PluginResolver,
  tokens,
} from '@stryker-mutator/api/plugin';
import { InjectableFunctionWithInject, InjectionToken, Injector } from 'typed-inject';

export class PluginCreator<TPluginKind extends PluginKind> {
  private constructor(
    private readonly kind: TPluginKind,
    private readonly pluginResolver: PluginResolver,
    private readonly injector: Injector<PluginContexts[TPluginKind]>
  ) {}

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

  private isFactoryPlugin(plugin: Plugin<PluginKind>): plugin is FactoryPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>> {
    return !!(plugin as FactoryPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>>).factory;
  }
  private isClassPlugin(plugin: Plugin<PluginKind>): plugin is ClassPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>> {
    return !!(plugin as ClassPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>>).injectableClass;
  }

  public static createFactory<TPluginKind extends PluginKind, TContext extends PluginContexts[TPluginKind]>(
    kind: TPluginKind
  ): InjectableFunctionWithInject<TContext, PluginCreator<TPluginKind>, [typeof commonTokens.pluginResolver, typeof commonTokens.injector]> {
    function factory(pluginResolver: PluginResolver, injector: Injector<TContext>): PluginCreator<TPluginKind> {
      return new PluginCreator(kind, pluginResolver, injector);
    }
    factory.inject = tokens(commonTokens.pluginResolver, commonTokens.injector);
    return factory;
  }
}
