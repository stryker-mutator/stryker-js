import { Scope } from './api/Scope';
import { InjectionToken, INJECTOR_TOKEN, TARGET_TOKEN } from './api/InjectionToken';
import { InjectableClass, InjectableFunction, Injectable } from './api/Injectable';
import { CorrespondingType } from './api/CorrespondingType';
import { Injector } from './api/Injector';
import Exception from './Exception';

const DEFAULT_SCOPE = Scope.Singleton;

/*

# Composite design pattern:

         ┏━━━━━━━━━━━━━━━━━━┓
         ┃ AbstractInjector ┃
         ┗━━━━━━━━━━━━━━━━━━┛
                 ▲
                 ┃
          ┏━━━━━━┻━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━┓
          ┃                      ┃                          ┃
 ┏━━━━━━━━┻━━━━━┓   ┏━━━━━━━━━━━━┻━━━━━━━━━━━┓      ┏━━━━━━━┻━━━━━━━┓
 ┃ RootInjector ┃   ┃ AbstractCachedInjector ┃      ┃ ValueInjector ┃
 ┗━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━━━━━━━━━━┛      ┗━━━━━━━━━━━━━━━┛
                                ▲
                                ┃
                        ┏━━━━━━━┻━━━━━━━━━━━━┓
               ┏━━━━━━━━┻━━━━━━━━┓  ┏━━━━━━━━┻━━━━━━┓
               ┃ FactoryInjector ┃  ┃ ClassInjector ┃
               ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━┛
*/

abstract class AbstractInjector<TContext> implements Injector<TContext>  {
  public injectClass<R, Tokens extends InjectionToken<TContext>[]>(Class: InjectableClass<TContext, R, Tokens>, providedIn?: Function): R {
    try {
      const args: any[] = this.resolveParametersToInject(Class, providedIn);
      return new Class(...args as any);
    } catch (error) {
      throw new Exception(`Could not inject "${Class.name}"`, error);
    }
  }

  public injectFunction<R, Tokens extends InjectionToken<TContext>[]>(fn: InjectableFunction<TContext, R, Tokens>, providedIn?: Function): R {
    try {
      const args: any[] = this.resolveParametersToInject(fn, providedIn);
      return fn(...args as any);
    } catch (error) {
      throw new Exception(`Could not inject "${fn.name}"`, error);
    }
  }

  private resolveParametersToInject<Tokens extends InjectionToken<TContext>[]>(injectable: Injectable<TContext, any, Tokens>, target?: Function): any[] {
    const tokens: InjectionToken<TContext>[] = (injectable as any).inject || [];
    return tokens.map(key => this.resolve(key, injectable, target));
  }

  public provideValue<Token extends string, R>(token: Token, value: R): AbstractInjector<{ [k in Token]: R; } & TContext> {
    return new ValueInjector(this, token, value);
  }

  public provideClass<Token extends string, R, Tokens extends InjectionToken<TContext>[]>(token: Token, Class: InjectableClass<TContext, R, Tokens>, scope = DEFAULT_SCOPE)
    : AbstractInjector<{ [k in Token]: R; } & TContext> {
    return new ClassInjector(this, token, scope, Class);
  }
  public provideFactory<Token extends string, R, Tokens extends InjectionToken<TContext>[]>(token: Token, factory: InjectableFunction<TContext, R, Tokens>, scope = DEFAULT_SCOPE)
    : AbstractInjector<{ [k in Token]: R; } & TContext> {
    return new FactoryInjector(this, token, scope, factory);
  }

  public resolve<Token extends InjectionToken<TContext>>(token: Token, providedIn?: Function, target?: Function): CorrespondingType<TContext, Token> {
    switch (token) {
      case TARGET_TOKEN:
        return target as any;
      case INJECTOR_TOKEN:
        return this as any;
      default:
        return this.resolveInternal(token, providedIn);
    }
  }

  protected abstract resolveInternal<Token extends InjectionToken<TContext>>(token: Token, target?: Function): CorrespondingType<TContext, Token>;
}

class RootInjector extends AbstractInjector<{}> {
  public resolveInternal<Token extends InjectionToken<{}>>(token: Token)
    : CorrespondingType<{}, Token> {
    throw new Error(`No provider found for "${token}"!.`);
  }
}

type ChildContext<TParentContext, R, Token extends string> = TParentContext & { [k in Token]: R };

class ValueInjector<TParentContext, R, Token extends string> extends AbstractInjector<ChildContext<TParentContext, R, Token>> {

  constructor(private readonly parent: AbstractInjector<TParentContext>, private readonly token: Token, private readonly value: R) {
    super();
  }

  protected resolveInternal<SearchToken extends InjectionToken<ChildContext<TParentContext, R, Token>>>(token: SearchToken, target: Function)
    : CorrespondingType<ChildContext<TParentContext, R, Token>, SearchToken> {
    if (token === this.token) {
      return this.value as any;
    } else {
      return this.parent.resolve(token as any, target) as any;
    }
  }
}

abstract class AbstractCachedInjector<TParentContext, R, Token extends string> extends AbstractInjector<ChildContext<TParentContext, R, Token>> {

  private cached: { value?: any } | undefined;

  constructor(protected readonly parent: AbstractInjector<TParentContext>,
              protected readonly token: Token,
              private readonly scope: Scope) {
    super();
  }

  protected resolveInternal<SearchToken extends InjectionToken<ChildContext<TParentContext, R, Token>>>(token: SearchToken, target: Function | undefined)
    : CorrespondingType<ChildContext<TParentContext, R, Token>, SearchToken> {
    if (token === this.token) {
      if (this.cached) {
        return this.cached.value as any;
      } else {
        const value = this.result(target);
        if (this.scope === Scope.Singleton) {
          this.cached = { value };
        }
        return value as any;
      }
    } else {
      return this.parent.resolve(token as any, target) as any;
    }
  }

  protected abstract result(target: Function | undefined): R;
}

class FactoryInjector<TParentContext, R, Token extends string, Tokens extends InjectionToken<TParentContext>[]> extends AbstractCachedInjector<TParentContext, R, Token> {
  constructor(parent: AbstractInjector<TParentContext>,
              token: Token,
              scope: Scope,
              private readonly injectable: InjectableFunction<TParentContext, R, Tokens>) {
    super(parent, token, scope);
  }
  protected result(target: Function): R {
    return this.injectFunction(this.injectable as any, target);
  }
}

class ClassInjector<TParentContext, R, Token extends string, Tokens extends InjectionToken<TParentContext>[]> extends AbstractCachedInjector<TParentContext, R, Token> {
  constructor(parent: AbstractInjector<TParentContext>,
              token: Token,
              scope: Scope,
              private readonly injectable: InjectableClass<TParentContext, R, Tokens>) {
    super(parent, token, scope);
  }
  protected result(target: Function): R {
    return this.injectClass(this.injectable as any, target);
  }
}

export const rootInjector = new RootInjector() as Injector<{}>;
