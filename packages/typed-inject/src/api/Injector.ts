import { InjectableClass, InjectableFunction } from './Injectable';
import { CorrespondingType } from './CorrespondingType';
import { InjectionToken } from './InjectionToken';
import { Scope } from './Scope';

export interface Injector<TContext = {}> {
  injectClass<R, Tokens extends InjectionToken<TContext>[]>(Class: InjectableClass<TContext, R, Tokens>): R;
  injectFunction<R, Tokens extends InjectionToken<TContext>[]>(Class: InjectableFunction<TContext, R, Tokens>): R;
  resolve<Token extends InjectionToken<TContext>>(token: Token): CorrespondingType<TContext, Token>;
  provideValue<Token extends string, R>(token: Token, value: R): Injector<{ [k in Token]: R } & TContext>;
  provideClass<Token extends string, R, Tokens extends InjectionToken<TContext>[]>(token: Token, Class: InjectableClass<TContext, R, Tokens>, scope?: Scope)
    : Injector<{ [k in Token]: R } & TContext>;
  provideFactory<Token extends string, R, Tokens extends InjectionToken<TContext>[]>(token: Token, factory: InjectableFunction<TContext, R, Tokens>, scope?: Scope)
    : Injector<{ [k in Token]: R } & TContext>;
}
