import { Injectable, InjectorKey, Container, PluginResolver } from 'stryker-api/di';
import Providers, { ProviderKind, Provider } from './Providers';
import { getLogger } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';

abstract class Injector {
  public inject<T, TArgKeys extends InjectorKey[]>(Constructor: Injectable<T, TArgKeys>): T {
    const args: any[] = Constructor.inject.map(key => this.resolve(key, Constructor));
    return new Constructor(...args as any);
  }

  public abstract resolve<T extends InjectorKey>(key: T, target: Function): Container[T];

  public createChildInjector(context: Partial<Providers>): Injector {
    return new ChildInjector(this, context);
  }

  public static create(pluginResolver: PluginResolver, options: Config): Injector {
    return new RootInjector()
      .createChildInjector({
        // TODO: Remove `config` once old way of loading plugins is gone
        config: { kind: ProviderKind.Value, value: options },
        getLogger: { kind: ProviderKind.Value, value: getLogger },
        logger: { kind: ProviderKind.Factory, factory: Constructor => getLogger(Constructor.name) },
        options: { kind: ProviderKind.Value, value: options },
        pluginResolver: { kind: ProviderKind.Value, value: pluginResolver }
      });
  }
}

export default Injector;

class RootInjector extends Injector {
  public resolve<T extends InjectorKey>(key: T, target: Function): Container[T] {
    throw new Error(`Cannot resolve ${key} to inject into ${target.name}.`);
  }
}

class ChildInjector extends Injector {
  constructor(private readonly parent: Injector, private readonly context: Partial<Providers>) {
    super();
  }

  public resolve<TKey extends InjectorKey>(key: TKey, target: Function): Container[TKey] {
    if (key === 'inject') {
      return this.inject.bind(this);
    } else {

      const resolver: Provider<Container[TKey]> | undefined = this.context[key];
      if (resolver) {
        switch (resolver.kind) {
          case ProviderKind.Value:
            return resolver.value;
          case ProviderKind.Factory:
            return resolver.factory(target);
          default:
            throw resolverUnsupportedError(resolver);
        }
      } else {
        return this.parent.resolve(key, target);
      }
    }
  }
}

function resolverUnsupportedError(resolver: never) {
  return new Error(`Resolver ${resolver} is not supported`);
}
