import { CorrespondingTypes } from './CorrespondingType';
import { InjectionToken } from './InjectionToken';

export type InjectableClass<TContext, R, Tokens extends InjectionToken<TContext>[]> =
  ClassWithInjections<TContext, R, Tokens> | ClassWithoutInjections<R>;

export interface ClassWithInjections<TContext, R, Tokens extends InjectionToken<TContext>[]> {
  new(...args: CorrespondingTypes<TContext, Tokens>): R;
  readonly inject: Tokens;
}

export type ClassWithoutInjections<R> = new () => R;

export type InjectableFunction<TContext, R, Tokens extends InjectionToken<TContext>[]> =
  InjectableFunctionWithInject<TContext, R, Tokens> | InjectableFunctionWithoutInject<R>;

export interface InjectableFunctionWithInject<TContext, R, Tokens extends InjectionToken<TContext>[]> {
  (...args: CorrespondingTypes<TContext, Tokens>): R;
  readonly inject: Tokens;
}

export type InjectableFunctionWithoutInject<R> = () => R;

export type Injectable<TContext, R, Tokens extends InjectionToken<TContext>[]> = InjectableClass<TContext, R, Tokens> | InjectableFunction<TContext, R, Tokens>;
