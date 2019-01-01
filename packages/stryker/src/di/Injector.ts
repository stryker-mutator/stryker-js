import { Injectable, InjectionToken, Container, PluginResolver, CorrespondingType } from 'stryker-api/di';
import { Providers, Provider, FactoryProvider } from './Providers';
import { getLogger } from 'stryker-api/logging';
import { Config } from 'stryker-api/config';

abstract class Injector {
  public inject<T, TArgKeys extends InjectionToken[]>(injectable: Injectable<T, TArgKeys>): T {
    const args: any[] = injectable.inject.map(key => this.provide(key, injectable));
    return new injectable(...args as any);
  }

  public abstract provide<T extends InjectionToken>(key: T, target: Injectable<any, any>): CorrespondingType<T>;

  public createChildInjector(context: Partial<Providers>): Injector {
    return new ChildInjector(this, context);
  }

  public static create(pluginResolver: PluginResolver, options: Config): Injector {
    return new RootInjector()
      .createChildInjector({
        // TODO: Remove `config` once old way of loading plugins is gone
        config: { value: options },
        getLogger: { value: getLogger },
        logger: { factory: Constructor => getLogger(Constructor.name) },
        options: { value: options },
        pluginResolver: { value: pluginResolver }
      });
  }
}

export default Injector;

class RootInjector extends Injector {
  public provide<T extends InjectionToken>(key: T, target: Injectable<any, any>): CorrespondingType<T> {
    throw new Error(`Can not inject "${target.name}". No provider found for "${key}".`);
  }
}

class ChildInjector extends Injector {
  constructor(private readonly parent: Injector, private readonly context: Partial<Providers>) {
    super();
  }

  public provide<TToken extends InjectionToken>(token: TToken, target: Injectable<any, any>): CorrespondingType<TToken> {
    if (token === 'inject') {
      return this.inject.bind(this);
    } else if (typeof token === 'string') {
      return this.provideStringToken(token as any, target);
    } else {
      return this.inject(token as any);
    }
  }

  private provideStringToken<T extends keyof Container>(token: T, target: Injectable<any, any>) {
    const provider: Provider<CorrespondingType<T>> | undefined = this.context[token] as any;
    if (provider) {
      if (this.isFactoryProvider(provider)) {
        return provider.factory(target);
      } else {
        return provider.value;
      }
    } else {
      return this.parent.provide(token, target);
    }
  }

  private isFactoryProvider(provider: Provider<unknown>): provider is FactoryProvider<unknown> {
    return !!(provider as FactoryProvider<unknown>).factory;
  }
}
